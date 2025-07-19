import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getOtherUser } from "../../utils/getOtherUser";

export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const currentUserId = state.auth.user?._id;
      const response = await axios.get("/api/chat", {
        withCredentials: true,
      });
      const chats = response.data.data;
      const chatsWithOtherUser = chats.map((chat) => ({
        ...chat,
        otherUser: getOtherUser(chat, currentUserId),
      }));
      return chatsWithOtherUser;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to fetch chat list"]
      );
    }
  }
);

export const getChat = createAsyncThunk(
  "chat/getChat",
  async (chatId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const currentUserId = state.auth.user?._id;
      const response = await axios.get(`/api/chat/${chatId}`, {
        withCredentials: true,
      });
      const { chat, messages } = response.data.data;
      
      const chatWithOtherUser = {
        ...chat,
        otherUser: getOtherUser(chat, currentUserId),
      };
      return {
        chat: chatWithOtherUser,
        messages,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to fetch chat"]
      );
    }
  }
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (newChatData, thunkAPI) => {
    try {
      const response = await axios.post("/api/chat", newChatData, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to create chat"]
      );
    }
  }
);

export const renameChat = createAsyncThunk(
  "chat/renameChat",
  async ({ chatId, name }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/chat/rename/${chatId}`,
        { name },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to rename chat"]
      );
    }
  }
);

export const addUserToGroup = createAsyncThunk(
  "chat/addUserToGroup",
  async ({ chatId, userId }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/chat/addUser/${chatId}`,
        { userId },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to add user"]
      );
    }
  }
);

export const promoteToAdmin = createAsyncThunk(
  "chat/promoteToAdmin",
  async ({ chatId, userId }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/chat/promote_admin/${chatId}`,
        { userId },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to promote user"]
      );
    }
  }
);

export const removeMemberFromGroup = createAsyncThunk(
  "chat/removeMemberFromGroup",
  async ({ chatId, userId }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/chat/remove_member/${chatId}`,
        { userId },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to remove member"]
      );
    }
  }
);

export const demoteAdmin = createAsyncThunk(
  "chat/demoteAdmin",
  async ({ chatId, userId }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/chat/demote_admin/${chatId}`,
        { userId },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to demote admin"]
      );
    }
  }
);

export const leaveGroup = createAsyncThunk(
  "chat/leaveGroup",
  async (chatId, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/chat/leave_group/${chatId}`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data.data; // Or `response.data.data` if needed
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to leave group"]
      );
    }
  }
);

export const createMessage = createAsyncThunk(
  "chat/createMessage",
  async (messageData, thunkAPI) => {
    try {

      const response = await axios.post("/api/msg", messageData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data; // assuming your API returns the created message
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Message send failed"]
      );
    }
  }
);

export const deleteMessageForMe = createAsyncThunk(
  "chat/deleteMessageForMe",
  async (messageId, thunkAPI) => {
    try {
      const response=await axios.delete(`/api/msg/deleteMessageForMe/${messageId}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to delete message for you"]
      );
    }
  }
);

export const deleteMessageForEveryone = createAsyncThunk(
  "chat/deleteMessageForEveryone",
  async (messageId, thunkAPI) => {
    try {
      const response=await axios.delete(`/api/msg/deleteMessageForEveryone/${messageId}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to delete message for everyone"]
      );
    }
  }
);
