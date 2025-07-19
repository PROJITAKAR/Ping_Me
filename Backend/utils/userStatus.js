import UserModel from "../models/UserModel.js"; 
import logger from '../utils/logger.js';


export const setUserStatus = async (userId, status) => {
  try {
    const user= await UserModel.findByIdAndUpdate(
      userId,
      {
        status: status,
        lastSeen: status === "offline" ? new Date() : undefined,
      },
      { new: true }
    );
    return (status === "offline")? user?.lastSeen : null;
  } catch (err) {
    logger.error("Failed to update user status:", err.message);
  }
};

