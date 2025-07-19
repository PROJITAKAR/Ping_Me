import connectedUsers from "../utils/connectedUsers.js";
import { setUserStatus } from "../utils/userStatus.js";
import { getChatsOfUser } from "../utils/getChatsOfUser.js";
import MessageModel from "../models/MessageModel.js";
import logger from '../utils/logger.js';


const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    try {
      const userId = socket.handshake.query.userId;
      const chats = await getChatsOfUser(userId);
      if (!userId) {
        logger.log("Connection attempt without userId");
        return socket.disconnect();
      }

      logger.log("A user connected:", socket.id);
      connectedUsers.set(userId, socket.id);
      socket.join(userId);
      logger.log("User joined room:", userId);

      await setUserStatus(userId, "online");
      await MessageModel.updateMany(
        {
          chat: { $in: chats.map((c) => c._id) },
          deliveredTo: { $ne: userId },
          sender: { $ne: userId },
        },
        {
          $addToSet: { deliveredTo: userId },
        }
      );

      chats.forEach((chat) => {
        socket.to(chat._id.toString()).emit("messages-delivered", {
          chatId: chat._id,
          userId,
        });
      });
      io.emit("online-users", [...connectedUsers.keys()]);
      socket.emit("setup");

      socket.on("joinChat", (chatId) => {
        try {
          socket.join(chatId);
          logger.log(`User ${userId} joined chat: ${chatId}`);
          socket.emit("chat joined", { chatId, userId });
        } catch (err) {
          logger.error("Error in joinChat:", err.message);
        }
      });

      // ✅ TYPING EVENT
      socket.on("typing", ({ chatId, user }) => {
        socket.to(chatId).emit("typing", {
          chatId,
          user,
        });
      });

      // ✅ STOP TYPING EVENT
      socket.on("stop-typing", ({ chatId, user }) => {
        socket.to(chatId).emit("stop-typing", {
          chatId,
          user,
        });
      });

      socket.on(
        "messages-read",
        async ({ chatId, userId, lastReadMessageId }) => {
          try {
            const lastMsg = await MessageModel.findById(
              lastReadMessageId
            ).select("_id createdAt");
            if (!lastMsg) return;

            const result = await MessageModel.updateMany(
              {
                chat: chatId,
                createdAt: { $lte: lastMsg.createdAt },
                readBy: { $ne: userId },
                sender: { $ne: userId }, 
              },
              { $addToSet: { readBy: userId } }
            );

            logger.log(`✅ Marked ${result.modifiedCount} messages as read`);

            socket.to(chatId).emit("messages-read-by-user", {
              chatId,
              userId,
              lastReadMessageId,
            });
          } catch (error) {
            logger.error("❌ Error updating read status:", error.message);
          }
        }
      );

      socket.on("disconnect", async () => {
        try {
          logger.log("User disconnected:", socket.id);
          for (const [uid, sid] of connectedUsers.entries()) {
            if (sid === socket.id) {
              connectedUsers.delete(uid);
              const lastSeen = await setUserStatus(userId, "offline");
              io.emit("online-users", [...connectedUsers.keys()]);
              chats.forEach((chat) => {
                socket.to(chat._id.toString()).emit("Update-user", {
                  userId,
                  updates: { lastSeen: lastSeen },
                });
              });

              break;
            }
          }
        } catch (err) {
          logger.error("Error during disconnect:", err.message);
        }
      });
    } catch (err) {
      logger.error("Socket connection error:", err.message);
      socket.disconnect();
    }
  });
};

export default socketHandler;
