import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchChatList, getChat } from "../../features/chat/chatThunks";
import { useSocket } from "../../context/SocketContext";
import { resetUnreadCount } from "../../features/chat/chatSlice";

const ChatList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);

  const dispatch = useDispatch();
  const { chats, selectedChat, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const typingUsersByChatId = useSelector(
    (state) => state.chat.typingUsersByChatId
  );
  const [typingDots, setTypingDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getChatList = async () => {
      try {
        const response = await dispatch(fetchChatList()).unwrap();
        console.log("Chat list fetched:", response);

        if (socket) {
          if (socket.connected) {
            response.forEach((chat) => socket.emit("joinChat", chat._id));
          } else {
            socket.on("connect", () => {
              response.forEach((chat) => socket.emit("joinChat", chat._id));
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
        toast.error("Failed to fetch chats");
      }
    };

    getChatList();
  }, [dispatch, socket]);

  useEffect(() => {
    const filtered = chats.filter(
      (chat) =>
        chat.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
        chat.otherUser?.username
          ?.toLowerCase()
          .includes(searchInput.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchInput, chats]);

  const getChatHandler = async (chatId) => {
    try {
      const result = await dispatch(getChat(chatId)).unwrap();
      dispatch(resetUnreadCount(chatId));
      console.log("Chat fetched:", result);
      socket.emit("joinChat", chatId);
    } catch (error) {
      console.error("Failed to get chat:", error);
      toast.error("Failed to get chat");
    }
  };

  return (
    <div className="ml-20 w-82 flex flex-col p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full shadow-2xl rounded-lg overflow-hidden border border-slate-700">
      <h2 className="text-2xl font-bold mb-4 px-2 text-blue-100">Chats</h2>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 placeholder-slate-400"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
        <ul className="flex flex-col space-y-3">
          {loading ? (
            <li className="text-slate-400">Loading chats...</li>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <li
                key={chat._id}
                className={`w-full px-4 py-3 rounded-xl cursor-pointer shadow-sm transition-all duration-200 border ${
                  selectedChat && selectedChat._id === chat._id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500"
                    : "bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500"
                }`}
                onClick={() => getChatHandler(chat._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 mr-3">
                    <img
                      src={
                        chat?.otherUser?.profilePic ||
                        "https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg"
                      }
                      alt={chat.name || chat.otherUser?.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                    />
                    {chat.otherUser && (
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                          chat.otherUser.status === "online"
                            ? "bg-green-500"
                            : "bg-slate-500"
                        }`}
                      ></span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-blue-100">
                      {chat.name || chat.otherUser?.username}
                    </div>
                    <div className="text-sm text-slate-300">
                      {typingUsersByChatId?.[chat._id]?.length > 0 ? (
                        <p className="text-blue-400">
                          {typingUsersByChatId[chat._id]
                            .filter((u) => u._id !== user._id)
                            .map((u) => u.username)
                            .join(", ")}{" "}
                          typing{typingDots}
                        </p>
                      ) : chat.latestMessage ? (
                        <p>
                          {chat.latestMessage.text
                            ? chat.latestMessage.text.length > 20
                              ? `${chat.latestMessage.text.slice(0, 20)}...`
                              : chat.latestMessage.text
                            : chat.latestMessage.attachments
                            ? "📎 Attachment"
                            : "New message"}
                        </p>
                      ) : chat.isGroup ? (
                        <p>Created by {chat.createdBy?.username}</p>
                      ) : (
                        <p>{chat.otherUser?.bio}</p>
                      )}
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-slate-400">No chats found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;
