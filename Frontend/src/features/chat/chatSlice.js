import { createSlice } from "@reduxjs/toolkit";

import {
  fetchChatList,
  getChat,
  createChat,
  renameChat,
  addUserToGroup,
  promoteToAdmin,
  removeMemberFromGroup,
  demoteAdmin,
  leaveGroup,
  createMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
} from "../chat/chatThunks";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messagesByChatId: {},
    selectedChat: null,
    chats: [],
    typingUsersByChatId: {},
    Loading: false,
    error: null,
  },
  reducers: {
    // Reset all chat-related state
    clearChatState: (state) => {
      state.messagesByChatId = {};
      state.selectedChat = null;
      state.Loading = false;
      state.error = null;
    },

    // Add a new message to the chat's message list
    addMessage: (state, action) => {
      const message = action.payload;
      const chatId =
        typeof message.chat === "object" ? message.chat._id : message.chat;

      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }

      const alreadyExists = state.messagesByChatId[chatId].some(
        (msg) => msg._id === message._id
      );

      if (!alreadyExists) {
        state.messagesByChatId[chatId] = [
          ...state.messagesByChatId[chatId],
          message,
        ];

        state.messagesByChatId[chatId].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }

      state.messagesByChatId[chatId].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    },

    // Update chat preview with the latest message and increase unread count
    updateChatPreview: (state, action) => {
      const newMessage = action.payload;
      const chatId =
        typeof newMessage.chat === "object"
          ? newMessage.chat._id
          : newMessage.chat;

      const chatIndex = state.chats.findIndex((c) => c._id === chatId);
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];

        // Update latest message and unread count
        chat.latestMessage = newMessage;
        chat.unreadCount = (chat.unreadCount || 0) + 1;

        // Move chat to top
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(chat);
      }
    },
    // Reset unread message count for a chat
    resetUnreadCount: (state, action) => {
      const chatId = action.payload;
      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) {
        chat.unreadCount = 0;
      }
    },

    // Update latest message in selectedChat and its list entry
    updateSelectedChatLatestMessage: (state, action) => {
      const newMessage = action.payload;

      if (
        state.selectedChat &&
        state.selectedChat._id === newMessage.chat._id
      ) {
        state.selectedChat.latestMessage = newMessage;

        const chat = state.chats.find((c) => c._id === newMessage.chat._id);
        if (chat) {
          chat.latestMessage = newMessage;
        }
      }
    },

    // Add a new chat to the chat list if it doesn't already exist
    addChatToList: (state, action) => {
      const newChat = action.payload;
      const existingChat = state.chats.find((chat) => chat._id === newChat._id);
      if (!existingChat) {
        state.chats.unshift(newChat);
      }
    },

    // Update online/offline status of users in direct chats
    updateUserStatus: (state, action) => {
      const onlineUsers = action.payload;
      state.chats.forEach((chat) => {
        if (chat.isGroup) return;
        if (chat.otherUser) {
          chat.otherUser.status = onlineUsers.includes(chat.otherUser._id)
            ? "online"
            : "offline";
        }
      });
      if (state.selectedChat && state.selectedChat.otherUser) {
        state.selectedChat.otherUser.status = onlineUsers.includes(
          state.selectedChat.otherUser._id
        )
          ? "online"
          : "offline";
      }
    },

    // Add a user to the typing list for a chat
    addTypingUser: (state, action) => {
      const { chatId, user } = action.payload;
      if (!state.typingUsersByChatId[chatId]) {
        state.typingUsersByChatId[chatId] = [];
      }

      const alreadyTyping = state.typingUsersByChatId[chatId].some(
        (u) => u._id === user._id
      );

      if (!alreadyTyping) {
        state.typingUsersByChatId[chatId].push(user);
      }
    },

    // Remove a user from the typing list for a chat
    removeTypingUser: (state, action) => {
      const { chatId, user } = action.payload;
      if (state.typingUsersByChatId[chatId]) {
        state.typingUsersByChatId[chatId] = state.typingUsersByChatId[
          chatId
        ].filter((u) => u._id !== user._id);
      }
    },

    updateOtherUserDetails: (state, action) => {
      const { userId, updates } = action.payload;

      state.chats.forEach((chat) => {
        if (chat.otherUser && chat.otherUser._id === userId) {
          chat.otherUser = {
            ...chat.otherUser,
            ...updates,
          };
        }
      });

      if (
        state.selectedChat &&
        state.selectedChat.otherUser &&
        state.selectedChat.otherUser._id === userId
      ) {
        state.selectedChat.otherUser = {
          ...state.selectedChat.otherUser,
          ...updates,
        };
      }
    },
    markMessagesAsRead: (state, action) => {
      const { chatId, userId, lastReadMessageId } = action.payload;
      const messages = state.messagesByChatId[chatId];

      if (messages) {
        for (const msg of messages) {
          if (!msg.readBy) msg.readBy = [];

          if (!msg.readBy.includes(userId)) {
            msg.readBy.push(userId);
          }

          if (msg._id === lastReadMessageId) {
            break; // Stop after this one
          }
        }

        const chat = state.chats.find((c) => c._id === chatId);
        if (chat) {
          chat.unreadCount = 0;
        }
      }
    },

    markMessagesAsDelivered: (state, action) => {
      const { chatId, userId } = action.payload;
      const messages = state.messagesByChatId[chatId];

      if (messages) {
        for (const msg of messages) {
          // Don't mark as delivered if already read (read implies delivered)
          const isAlreadyDelivered = msg.deliveredTo?.includes(userId);
          const isAlreadyRead = msg.readBy?.includes(userId);

          if (!isAlreadyDelivered && !isAlreadyRead) {
            if (!msg.deliveredTo) {
              msg.deliveredTo = [];
            }
            msg.deliveredTo.push(userId);
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.Loading = true;
        state.error = null;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.Loading = false;
        state.chats = action.payload.map((chat) => ({
          ...chat,
          unreadCount: chat.unreadCount || 0, // make sure it's set
        }));
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.Loading = false;
        state.error = action.payload;
      })
      .addCase(getChat.pending, (state) => {
        state.Loading = true;
        state.error = null;
      })
      .addCase(getChat.fulfilled, (state, action) => {
        const { chat, messages } = action.payload;
        state.Loading = false;
        state.selectedChat = chat;
        state.messagesByChatId[chat._id] = messages;

        const chatInList = state.chats.find((c) => c._id === chat._id);
        if (chatInList) {
          chatInList.unreadCount = 0;
        }
      })
      .addCase(getChat.rejected, (state, action) => {
        state.Loading = false;
        state.error = action.payload;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.Loading = false;

        const newChat = action.payload;
        const existingChat = state.chats.find(
          (chat) => chat._id === newChat._id
        );

        if (!existingChat) {
          state.chats.unshift(newChat);
        }

        state.selectedChat = newChat;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.Loading = false;
        state.error = action.payload;
      })
      .addCase(renameChat.fulfilled, updateChat)
      .addCase(addUserToGroup.fulfilled, updateChat)
      .addCase(promoteToAdmin.fulfilled, updateChat)
      .addCase(removeMemberFromGroup.fulfilled, updateChat)
      .addCase(demoteAdmin.fulfilled, updateChat)
      .addCase(leaveGroup.fulfilled, (state, action) => {
        const chatId = action.meta.arg;
        state.chats = state.chats.filter((chat) => chat._id !== chatId);
        delete state.messagesByChatId[chatId];
        if (state.selectedChat?._id === chatId) {
          state.selectedChat = null;
        }
        state.Loading = false;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        const newMessage = action.payload;
        const chatId =
          typeof newMessage.chat === "object"
            ? newMessage.chat._id
            : newMessage.chat;

        if (!state.messagesByChatId[chatId]) {
          state.messagesByChatId[chatId] = [];
        }
        const alreadyExists = state.messagesByChatId[chatId].some(
          (msg) => msg._id === newMessage._id
        );

        if (!alreadyExists) {
          state.messagesByChatId[chatId] = [
            ...state.messagesByChatId[chatId],
            newMessage,
          ];
        }

        const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
        if (chatIndex !== -1) {
          const [chatToMove] = state.chats.splice(chatIndex, 1);
          state.chats.unshift(chatToMove);
        }

        state.Loading = false;
      })
      .addCase(deleteMessageForMe.fulfilled, (state, action) => {
        const { messageId, userId, chatId, newLatestMessage } = action.payload;

        const msgList = state.messagesByChatId[chatId];
        if (!msgList) return;

        const msg = msgList.find((m) => m._id === messageId);
        if (msg) {
          if (!msg.deletedFor) msg.deletedFor = [];
          if (!msg.deletedFor.includes(userId)) {
            msg.deletedFor.push(userId);
          }
        }
        if (newLatestMessage !== undefined) {
          const chat = state.chats.find((c) => c._id === chatId);
          if (chat) {
            chat.latestMessage = newLatestMessage;
          }

          if (state.selectedChat?._id === chatId) {
            state.selectedChat.latestMessage = newLatestMessage;
          }
        }
      })
      .addCase(deleteMessageForEveryone.fulfilled, (state, action) => {
        const { messageId, chatId } = action.payload;

        const chatMessages = state.messagesByChatId[chatId];
        if (chatMessages) {
          const msgIndex = chatMessages.findIndex(
            (msg) => msg._id === messageId
          );
          if (msgIndex !== -1) {
            chatMessages[msgIndex] = {
              ...chatMessages[msgIndex],
              text: "This message was deleted",
              attachments: [],
              isDeleted: true,
            };
          }
        }
      })
      .addMatcher(
        (action) => action.type.endsWith("pending"),
        (state) => {
          state.Loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("rejected"),
        (state, action) => {
          state.Loading = false;
          state.error = action.payload;
        }
      );
  },
});

function updateChat(state, action) {
  const updated = action.payload;
  state.chats = state.chats.map((chat) =>
    chat._id === updated._id ? updated : chat
  );
  if (state.selectedChat?._id === updated._id) {
    state.selectedChat = updated;
  }
  state.Loading = false;
}

export const {
  clearChatState,
  addMessage,
  updateChatPreview,
  resetUnreadCount,
  updateSelectedChatLatestMessage,
  addChatToList,
  updateUserStatus,
  addTypingUser,
  removeTypingUser,
  updateOtherUserDetails,
  markMessagesAsRead,
  markMessagesAsDelivered,
} = chatSlice.actions;
export default chatSlice.reducer;
