import MessageModel from "../models/MessageModel.js";
import ChatModel from "../models/ChatModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import extractPublicId from "../utils/extractPublicId.js";
import connectedUsers from "../utils/connectedUsers.js";
import logger from '../utils/logger.js';


export const createMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user._id;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required",
        errors: ["Chat ID is required"],
      });
    }

    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat not found"],
      });
    }

    if (!chat.members.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat",
        errors: ["You are not a member of this chat"],
      });
    }

    if (!text && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Message text or attachment is required",
        errors: ["Message text or attachment is required"],
      });
    }

    let uploadedUrl = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "chat-attachments", resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      uploadedUrl = result.secure_url;
    }

    const deliveredTo = chat.members.filter(
      (id) =>
        id.toString() !== senderId.toString() &&
        connectedUsers.has(id.toString())
    );

    const message = await MessageModel.create({
      chat: chatId,
      sender: senderId,
      text,
      attachments: uploadedUrl ? [uploadedUrl] : [],
      deliveredTo,
    });

    await ChatModel.findByIdAndUpdate(chatId, { latestMessage: message._id });

    const populatedMessage = await MessageModel.findById(message._id)
      .populate("sender", "-password")
      .populate({
        path: "chat",
        populate: {
          path: "members createdBy groupAdmins latestMessage",
          select: "-password",
        },
      });

    chat.members.forEach((memberId) => {
      req.io.to(memberId.toString()).emit("receive-message", populatedMessage);
    });
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      errors: [error.message],
    });
  }
};

export const deleteMessageForMe = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await MessageModel.findById(messageId).populate("chat");
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
        errors: ["Message not found"],
      });
    }

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    const chat = message.chat;
    const latestMessageId = (
      chat.latestMessage?._id || chat.latestMessage
    )?.toString?.();
    const deletedMessageId = message._id.toString();

    let newLatestMessage = undefined;

    if (latestMessageId === deletedMessageId) {
      const recentVisible = await MessageModel.find({
        chat: chat._id,
        _id: { $ne: message._id },
        deletedFor: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .limit(1);

      newLatestMessage = recentVisible[0] || null;

      chat.latestMessage = newLatestMessage;
      await chat.save();
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted for you",
      data: {
        messageId,
        userId,
        chatId: chat._id,
        newLatestMessage, // will be undefined if not latest
      },
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [err.message],
    });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await MessageModel.findById(messageId).populate("chat");
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
        errors: ["Message not found"],
      });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        errors: ["Unauthorized"],
      });
    }

    // Delete attachments from Cloudinary
    for (const url of message.attachments) {
      const publicId = extractPublicId(url);
      if (publicId) {
        const ext = url.split(".").pop().split("?")[0].toLowerCase();

        let resourceType = "image";
        if (["mp4", "webm", "ogg", "mov", "mkv"].includes(ext)) {
          resourceType = "video";
        } else if (
          !["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
        ) {
          resourceType = "raw";
        }

        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
          });
          logger.log(
            "✅ Deleted from Cloudinary:",
            publicId,
            "| Type:",
            resourceType
          );
        } catch (err) {
          logger.error("❌ Cloudinary delete failed:", publicId, err.message);
        }
      } else {
        logger.warn("⚠️ Could not extract publicId for:", url);
      }
    }

    // Mark as deleted
    message.text = "This message was deleted";
    message.attachments = [];
    message.isDeleted = true;
    await message.save();

    // Emit event to all chat members
    message.chat.members.forEach((memberId) => {
      req.io.to(memberId.toString()).emit("message-deleted-everyone", {
        messageId: message._id,
        chatId: message.chat._id.toString(),
      });
    });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: {
        messageId: message._id,
        chatId: message.chat._id.toString(), // or message.chat._id if populated
      },
    });
  } catch (err) {
    logger.error("Delete message error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error", errors: [err.message] });
  }
};
