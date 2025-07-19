import ChatModel from "../models/ChatModel.js";

export const getChatsOfUser = async (userId) => {
  return await ChatModel.find({ members: userId });
};
