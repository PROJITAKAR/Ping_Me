import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import {
  updateChatPreview,
  addMessage,
  updateSelectedChatLatestMessage,
  addChatToList,
  addTypingUser,
  removeTypingUser,
  markMessagesAsRead,
  markMessagesAsDelivered,
} from "../../features/chat/chatSlice";
import { getOtherUser } from "../../utils/getOtherUser"; // Ensure this utility is correctly imported

const SocketEventsHandler = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const selectedChatId = useSelector((state) => state.chat.selectedChat?._id);
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats);
  const typingUsersByChatId = useSelector(
    (state) => state.chat.typingUsersByChatId
  );

  useEffect(() => {
    if (!socket || !user) return;

    //  NEW MESSAGE
    const handleNewMessage = (newMessage) => {
      const chat = newMessage.chat;
      const chatId = typeof chat === "object" ? chat._id : chat;

      const existingChat = chats.find((c) => c._id === chatId);

      if (!existingChat) {
        // Direct chat → attach otherUser before adding
        if (!chat.isGroup) {
          const otherUser = getOtherUser(chat, user._id);
          chat.otherUser = otherUser;
        }

        dispatch(addChatToList(chat));
      }

      if (!selectedChatId || selectedChatId !== chatId) {
        dispatch(updateChatPreview(newMessage));
      } else {
        dispatch(addMessage(newMessage));
        dispatch(updateSelectedChatLatestMessage(newMessage));
        if (newMessage.sender._id !== user._id) {
          socket.emit("messages-read", {
            chatId: selectedChatId,
            userId: user._id,
            lastReadMessageId: newMessage._id,
          });
        }
      }
    };

    const handleDeleteMsg = (data) => {
      if (!data.chatId || !data.messageId) return;

      dispatch({
        type: "chat/deleteMessageForEveryone/fulfilled",
        payload: data,
      });
    };

    socket.on("message-deleted-everyone", handleDeleteMsg);
    socket.on("receive-message", handleNewMessage);
    socket.on("typing", ({ chatId, user }) => {
      dispatch(addTypingUser({ chatId, user }));
    });
    socket.on(
      "messages-read-by-user",
      ({ chatId, userId, lastReadMessageId }) => {
        // Only update if it's not the current user who read the messages
        if (userId !== user._id) {
          dispatch(markMessagesAsRead({ chatId, userId, lastReadMessageId }));
        }
      }
    );
    socket.on("messages-delivered", ({ chatId, userId }) => {
      dispatch(markMessagesAsDelivered({ chatId, userId }));
    });

    socket.on("stop-typing", ({ chatId, user }) => {
      dispatch(removeTypingUser({ chatId, user }));
    });

    return () => {
      socket.off("receive-message", handleNewMessage);
      socket.off("message-deleted-everyone", handleDeleteMsg);
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("messages-read-by-user");
      socket.off("messages-delivered");
    };
  }, [socket, user, selectedChatId, dispatch, chats, typingUsersByChatId]);

  return null;
};

export default SocketEventsHandler;
