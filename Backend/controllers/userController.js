// controllers/userController.js
import UserModel from "../models/UserModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { getChatsOfUser } from "../utils/getChatsOfUser.js";
import logger from '../utils/logger.js';


const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.status(200).json({
      success: true,
      message: "Fetched all users",
      data: users,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", errors: [err.message] });
  }
};

const updateProfilepic = async (req, res) => {
  try {
    const file = req.file;
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: ["User not found"],
      });
    }

    let uploadedUrl = "";

    if (file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "user-profile",
            public_id: `user_${user_id}`,
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      uploadedUrl = result.secure_url;
    }

    user.profilePic = uploadedUrl;
    await user.save();
    const chats = await getChatsOfUser(user_id);
    chats.forEach((chat) => {
      req.io.to(chat._id.toString()).emit("Update-user", {
        userId: user_id,
        updates: {profilePic: uploadedUrl},
      });
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("❌ Final catch error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: ["Internal Server Error"],
    });
  }
};

const updateUsername = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
        errors: ["Username cannot be empty"],
      });
    }

    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: ["User not found"],
      });
    }

    user.username = username;
    await user.save();
    const chats = await getChatsOfUser(user_id);
    chats.forEach((chat) => {
      req.io.to(chat._id.toString()).emit("Update-user", {
        userId: user_id,
        updates: {username: username},
      });
    });

    return res.status(200).json({
      success: true,
      message: "Username updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("❌ Error updating username:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: ["Internal Server Error"],
    });
  }
};

const updateBio = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { bio } = req.body;

    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: ["User not found"],
      });
    }

    user.bio = bio || "";
    await user.save();
    const chats = await getChatsOfUser(user_id);
    chats.forEach((chat) => {
      req.io.to(chat._id.toString()).emit("Update-user", {
        userId: user_id,
        updates: {bio: bio || ""},
      });
    });

    return res.status(200).json({
      success: true,
      message: "Bio updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("❌ Error updating bio:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: ["Internal Server Error"],
    });
  }
};

export { getAllUsers, updateProfilepic, updateUsername, updateBio };
