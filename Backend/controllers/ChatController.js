import chatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";
import MessageModel from "../models/MessageModel.js";
import mongoose from "mongoose";

const createChat = async (req, res) => {
  try {
    const { name, isGroup, members, groupAdmins, description } = req.body;
    const createdBy = req.user._id;
    if (isGroup) {
      if (!name || !members || !groupAdmins || members.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Invalid group chat data",
          errors: [
            "Name, members, and group admins are required for group chats",
          ],
        });
      }
      const usersExist = await UserModel.find({ _id: { $in: members } });

      if (usersExist.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: "One or more user IDs are invalid",
          errors: ["One or more user IDs are invalid"],
        });
      }

      const allAdminsAreMembers = groupAdmins.every((adminId) =>
        members.includes(adminId)
      );

      if (!allAdminsAreMembers) {
        return res.status(400).json({
          success: false,
          message: "All group admins must also be members of the chat",
          errors: ["All group admins must also be members of the chat"],
        });
      }

      const groupChat = await chatModel.create({
        name,
        isGroup,
        members,
        createdBy,
        groupAdmins,
        description,
      });
      return res.status(201).json({
        success: true,
        message: "Group chat created successfully",
        data: groupChat,
      });
    } else {
      if (
        !Array.isArray(members) ||
        members.length !== 2 ||
        members[0] === members[1]
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid chat data",
          errors: ["Two *different* members are required for a direct chat"],
        });
      }

      const usersExist = await UserModel.find({ _id: { $in: members } });
      if (usersExist.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: "One or more user IDs are invalid",
          errors: ["One or more user IDs are invalid"],
        });
      }
      const existingChat = await chatModel
        .findOne({
          members: { $all: members, $size: 2 },
          isGroup: false,
        })
        .populate("members", "-password")
        .populate("groupAdmins", "-password")
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender text",
            select: "username email _id",
          },
        });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: "Chat already exists",
          data: existingChat,
        });
      }
      let directChat = await chatModel.create({
        isGroup,
        members,
      });

      directChat = await chatModel
        .findById(directChat._id)
        .populate("members", "-password")
        .populate("groupAdmins", "-password")
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender text",
            select: "username email _id",
          },
        });
      // server-side (e.g., Node.js + Socket.IO)
      directChat.members.forEach((member) => {
        req.io.to(member._id.toString()).emit("new-chat", directChat);
      });

      return res.status(201).json({
        success: true,
        message: "Direct chat created successfully",
        data: directChat,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await chatModel
      .find({ members: userId })
      .populate("members", "-password")
      .populate("groupAdmins", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "username email _id", 
        },
      })
      .sort({ updatedAt: -1 })
      .lean(); 

    const chatIds = chats.map((chat) => chat._id);

    const unreadCounts = await MessageModel.aggregate([
      {
        $match: {
          chat: { $in: chatIds },
          sender: { $ne: userId },        
          readBy: { $ne: userId },        
        },
      },
      {
        $group: {
          _id: "$chat",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadCounts.forEach((item) => {
      unreadMap[item._id.toString()] = item.count;
    });

    const updatedChats = chats.map((chat) => ({
      ...chat,
      unreadCount: unreadMap[chat._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      message: "Chats retrieved successfully",
      data: updatedChats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const getChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
        errors: ["Invalid chat"],
      });
    }

    const chat = await chatModel
      .findById(chatId)
      .populate("latestMessage")
      .populate("members", "-password")
      .populate("groupAdmins", "-password")
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat not found"],
      });
    }

    const messages = await MessageModel.find({
      chat: chatId,
      deletedFor: { $ne: userId },
    })
      .populate("sender", "-password")
      .select("+readBy") 
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Chat and messages retrieved successfully",
      data: { chat, messages },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const rename = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { name } = req.body;

    // Validate name
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "New name is required",
        errors: ["Chat name cannot be empty"],
      });
    }

    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
        errors: ["Invalid chat ID"],
      });
    }

    // Find chat
    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["No chat found with that ID"],
      });
    }

    // Restrict renaming to group chats only
    if (!chat.isGroup) {
      return res.status(400).json({
        success: false,
        message: "Cannot rename direct chat",
        errors: ["Only group chats can be renamed"],
      });
    }

    // Update name
    chat.name = name;
     await chat.save();

    updatedChat = await chatModel
      .findById(chatId)
      .populate("latestMessage")
      .populate("members", "-password")
      .populate("groupAdmins", "-password");

    return res.status(200).json({
      success: true,
      message: "Chat renamed successfully",
      data: updatedChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const addUser = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { userId } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat or user ID",
        errors: ["Invalid ObjectId"],
      });
    }

    // Find chat
    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat with provided ID does not exist"],
      });
    }

    // Must be a group chat
    if (!chat.isGroup) {
      return res.status(400).json({
        success: false,
        message: "Cannot add users to a direct chat",
        errors: ["Only group chats can have members added"],
      });
    }

    // Check if user already exists
    if (chat.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User already in the group",
        errors: ["Duplicate member not allowed"],
      });
    }

    // Confirm user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: ["Invalid user ID"],
      });
    }

    // Add user to group
    chat.members.push(userId);
    const updatedChat = await chat.save();

    const populatedChat = await chatModel
      .findById(updatedChat._id)
      .populate("latestMessage")
      .populate("members", "-password")
      .populate("groupAdmins", "-password");

    return res.status(200).json({
      success: true,
      message: "User added to group chat",
      data: populatedChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const promote_admin = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { userId } = req.body;
    const admin = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat or user ID",
        errors: ["Invalid ObjectId"],
      });
    }

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat with provided ID does not exist"],
      });
    }
    if (!chat.isGroup) {
      return res.status(400).json({
        success: false,
        message: "Cannot promote user in a direct chat",
        errors: ["Only group chats can have members promoted"],
      });
    }
    if (!chat.groupAdmins.includes(admin.toString())) {
      return res.status(403).json({
        success: false,
        message: "You are not an admin of this group",
        errors: ["Only group admins can promote other members"],
      });
    }
    if (!chat.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this group",
        errors: ["Cannot promote a user who is not in the group"],
      });
    }

    if (chat.groupAdmins.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
        errors: ["The user is already a group admin"],
      });
    }

    chat.groupAdmins.push(userId);
    const updatedChat = await chat.save();

    const populatedChat = await chatModel
      .findById(updatedChat._id)
      .populate("latestMessage")
      .populate("members", "-password")
      .populate("groupAdmins", "-password");
    return res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: populatedChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { userId } = req.body;
    const requester = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs",
        errors: ["Invalid chat or user ID"],
      });
    }

    const chat = await chatModel.findById(chatId);
    if (!chat)
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat not found"],
      });

    if (!chat.isGroup)
      return res.status(400).json({
        success: false,
        message: "Not a group chat",
        errors: ["Only group chats can have members removed"],
      });

    if (!chat.groupAdmins.includes(requester)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can remove members",
        errors: ["You must be a group admin to remove members"],
      });
    }

    if (!chat.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User not a group member",
        errors: ["User is not a member of this group"],
      });
    }

    chat.members = chat.members.filter((id) => id.toString() !== userId);
    chat.groupAdmins = chat.groupAdmins.filter(
      (id) => id.toString() !== userId
    );

    const updated = await chat.save();

    const populated = await chatModel
      .findById(updated._id)
      .populate("latestMessage")
      .populate("members", "-password")
      .populate("groupAdmins", "-password");

    return res.status(200).json({
      success: true,
      message: "User removed",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const demoteAdmin = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { userId } = req.body;
    const requester = req.user._id;

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat with provided ID does not exist"],
      });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        success: false,
        message: "Not a group chat",
        errors: ["Demotion only applies to group chats"],
      });
    }

    if (!chat.groupAdmins.includes(requester.toString())) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
        errors: ["Only group admins can demote other admins"],
      });
    }

    if (!chat.groupAdmins.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not an admin",
        errors: ["The specified user is not currently an admin"],
      });
    }

    chat.groupAdmins = chat.groupAdmins.filter(
      (id) => id.toString() !== userId
    );
    const updated = await chat.save();

    const populated = await chatModel
      .findById(updated._id)
      .populate("latestMessage")
      .populate("members", "-password")
      .populate("groupAdmins", "-password");

    return res.status(200).json({
      success: true,
      message: "User demoted successfully",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
        errors: ["Invalid chat ID"],
      });
    }

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
        errors: ["Chat with provided ID does not exist"],
      });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        success: false,
        message: "Cannot leave a direct chat",
        errors: ["Only group chats can be left"],
      });
    }

    // Remove user from members
    chat.members = chat.members.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Also remove from admin list if they are admin
    chat.groupAdmins = chat.groupAdmins.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Optional: Delete chat if no members left
    if (chat.members.length === 0) {
      await chatModel.findByIdAndDelete(chatId);
      return res.status(200).json({
        success: true,
        message: "Group deleted as last member left",
      });
    }

    const updatedChat = await chat.save();
    const populatedChat = await chatModel
      .findById(updatedChat._id)

      .populate("members", "-password")
      .populate("groupAdmins", "-password");

    return res.status(200).json({
      success: true,
      message: "Left group successfully",
      data: populatedChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      errors: [error.message],
    });
  }
};

export {
  createChat,
  getChats,
  getChat,
  rename,
  addUser,
  promote_admin,
  removeMember,
  demoteAdmin,
  leaveGroup,
};
