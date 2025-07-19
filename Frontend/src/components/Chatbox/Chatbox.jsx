import React, { useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { IoMdSend } from "react-icons/io";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  createMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
} from "../../features/chat/chatThunks";
import { updateSelectedChatLatestMessage } from "../../features/chat/chatSlice";
import chatPlaceholder from "../../assets/chat-placeholder.png";
import ChatDetail from "../ChatDetail/ChatDetail";
import EmojiPicker from "emoji-picker-react";
import { FiPaperclip, FiX } from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import formatTimeAgo from "../../utils/formatTimeAgo";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { markMessagesAsRead } from "../../features/chat/chatSlice";
import { FiTrash2, FiUserX } from "react-icons/fi";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const { selectedChat, Loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { messagesByChatId } = useSelector((state) => state.chat);
  const [messages, setMessages] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const currentUserId = user?._id;
  const [contextMsgId, setContextMsgId] = useState(null);
  const typingTimeout = useRef(null);
  const { socket } = useSocket();
  const { typingUsersByChatId } = useSelector((state) => state.chat);
  const [typingDots, setTypingDots] = useState(".");
  const fileInputRef = useRef(null);

  const getDateOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // returns "YYYY-MM-DD"
  };

  const formatChatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();

    // Set all times to midnight for accurate comparison
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Update messages whenever selectedChat or messagesByChatId changes
  useEffect(() => {
    const allMsgs =
      selectedChat && messagesByChatId[selectedChat._id]
        ? messagesByChatId[selectedChat._id]
        : [];

    const visibleMsgs = allMsgs.filter(
      (msg) => !msg.deletedFor?.includes(currentUserId)
    );

    setMessages(visibleMsgs);
    setMessage("");
    setFile(null);
    setFilePreview(null);
  }, [selectedChat, messagesByChatId?.[selectedChat?._id], user?._id]);

  useEffect(() => {
    const handleClickOutside = () => setContextMsgId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket || !user || !selectedChat?._id) return;

    const msgs = messagesByChatId[selectedChat._id];
    if (!msgs || msgs.length === 0) return;

    // Only mark as read when chat is first opened or when new messages arrive
    const unreadMsgs = msgs
      .filter((m) => m.sender._id !== user._id && !m.readBy?.includes(user._id))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort oldest → newest

    if (unreadMsgs.length > 0) {
      const lastUnread = unreadMsgs[unreadMsgs.length - 1]; // Now it's truly the latest

      dispatch(
        markMessagesAsRead({
          chatId: selectedChat._id,
          userId: user._id,
          lastReadMessageId: lastUnread._id,
        })
      );

      socket.emit("messages-read", {
        chatId: selectedChat._id,
        userId: user._id,
        lastReadMessageId: lastUnread._id,
      });
    }
  }, [selectedChat?._id, socket, user]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!selectedChat) return;
    if (!message.trim() && !file) {
      return;
    }

    const formData = new FormData();
    formData.append("chatId", selectedChat._id);
    formData.append("sender", user._id);
    if (message.trim()) {
      formData.append("text", message.trim());
    }

    if (file) {
      formData.append("attachment", file); // `file` should be a File object
    }

    try {
      const response = await dispatch(createMessage(formData)).unwrap();
      console.log(response);
      if (response) {
        dispatch(updateSelectedChatLatestMessage(response));
      }
      setMessage("");
      setFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };
  const onClose = () => {
    setShowDetail(false);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await dispatch(deleteMessageForMe(messageId)).unwrap();
    } catch (error) {
      console.error("Failed to delete for me:", error);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await dispatch(deleteMessageForEveryone(messageId)).unwrap();
    } catch (error) {
      console.error("Failed to delete for Everyone:", error);
    }
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex-1 m-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex items-center justify-center backdrop-blur-sm">
        <div className="text-center px-6">
          <img
            src={chatPlaceholder}
            alt="Start Chat"
            className="w-110 h-100 mx-auto mb-6 rounded-2xl opacity-60 object-cover shadow-lg"
          />
          <h2 className="text-2xl font-semibold text-slate-200 mb-3">
            No Chat Selected
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Select a person from the chat list or start a new conversation to
            begin messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 m-5 rounded-2xl text-white shadow-2xl flex flex-row h-full relative">
      <div className="flex-1 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex flex-col h-full backdrop-blur-sm border border-slate-700/50">
        {/* 1️⃣ Header (sticky at top) */}
        <div className="sticky top-0 z-10 bg-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-700/50 rounded-t-2xl">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <img
                src={
                  selectedChat?.otherUser?.profilePic ||
                  "https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg"
                }
                alt="User"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30 transition-all duration-300 hover:ring-blue-400/50"
                onClick={() => setShowDetail(!showDetail)}
              />
              {selectedChat?.otherUser?.status === "online" && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full shadow-lg"></div>
              )}
            </div>
            <div>
              <div
                className="font-semibold text-slate-100 hover:text-blue-300 transition-colors duration-200"
                onClick={() => setShowDetail(!showDetail)}
              >
                {selectedChat?.otherUser?.username}
              </div>
              <div
                className="text-sm"
                onClick={() => setShowDetail(!showDetail)}
              >
                <div className="text-sm">
                  <div className="text-sm">
                    {selectedChat &&
                    selectedChat._id &&
                    user &&
                    typingUsersByChatId[selectedChat._id]?.length > 0 ? (
                      <span className="text-blue-400 animate-pulse">
                        {typingUsersByChatId[selectedChat._id]
                          .filter((u) => u._id !== user._id)
                          .map((u) => u.username)
                          .join(", ")}{" "}
                        typing{typingDots}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {selectedChat?.otherUser?.status === "online"
                          ? "online"
                          : selectedChat?.otherUser?.lastSeen
                          ? `last seen ${formatTimeAgo(
                              selectedChat.otherUser.lastSeen
                            )}`
                          : "offline"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            title="Search"
            className="p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200"
          >
            {/* <FiSearch className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors duration-200" /> */}
          </button>
        </div>

        <div className="absolute inset-0 my-16 bg-[url('https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg')] bg-cover bg-center opacity-3 pointer-events-none" />
        <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar relative flex flex-col-reverse gap-y-5">
          {/* Faint background image */}
          <div className="relative z-10 space-y-5 mt-6">
            {messages.length > 0 ? (
              [...messages]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg, index, arr) => {
                  const isSentByUser = msg.sender._id === user._id;
                  const isLastMessage = index === arr.length - 1;
                  const isDeleted = msg.isDeleted === true;
                  const currentDate = getDateOnly(msg.createdAt);
                  const previousDate =
                    index > 0
                      ? getDateOnly(arr[index - 1].createdAt) // ✅ FIXED
                      : null;

                  const showDate = currentDate !== previousDate;

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <div className="text-center my-2 text-gray-500 text-sm">
                          {formatChatDate(msg.createdAt)}
                        </div>
                      )}

                      <div
                        key={msg._id}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMsgId(msg._id);
                        }}
                        className={`flex ${
                          isSentByUser ? "justify-end" : "items-start"
                        } group relative`}
                      >
                        {!isSentByUser && (
                          <img
                            src="https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg"
                            className="w-8 h-8 rounded-full shadow-lg ring-2 ring-slate-700/50"
                            alt="Sender"
                          />
                        )}

                        <div
                          className={`relative break-words ${
                            isSentByUser
                              ? isDeleted
                                ? "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 border border-slate-500/30 shadow-lg shadow-slate-500/20"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20"
                              : isDeleted
                              ? "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 border border-slate-500/50 ml-3 shadow-lg shadow-slate-900/20"
                              : "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 border border-slate-600/50 ml-3 shadow-lg shadow-slate-900/20"
                          } max-w-sm p-3 rounded-xl shadow-lg`}
                        >
                          {/* WhatsApp-style delete popup */}
                          {contextMsgId === msg._id && (
                            <div
                              className={`absolute z-20 scale-100 opacity-100 transition-all duration-200 ease-out ${
                                isLastMessage
                                  ? isSentByUser
                                    ? "bottom-full mb-2 right-0 items-end"
                                    : "bottom-full mb-2 left-0 items-start"
                                  : isSentByUser
                                  ? "top-full mt-2 right-0 items-end"
                                  : "top-full mt-2 left-0 items-start"
                              } flex flex-col`}
                            >
                              {/* Arrow */}
                              <div
                                className={`w-3 h-3 rotate-45 bg-slate-800 border-l border-t border-slate-600/50 absolute ${
                                  isLastMessage
                                    ? isSentByUser
                                      ? "right-4 -bottom-[6px]"
                                      : "left-4 -bottom-[6px]"
                                    : isSentByUser
                                    ? "right-4 -top-[6px]"
                                    : "left-4 -top-[6px]"
                                }`}
                              ></div>

                              {/* Delete box */}
                              <div className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-xl shadow-2xl px-4 py-3 space-y-2 w-max min-w-[180px]">
                                <button
                                  className="text-sm text-slate-200 hover:text-orange-400 hover:bg-orange-500/10 text-left w-full transition-colors duration-200 p-2 rounded-lg flex items-center gap-2"
                                  title="Delete for Me"
                                  onClick={() => {
                                    handleDeleteForMe(msg._id);
                                  }}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  Delete for Me
                                </button>
                                {isSentByUser && (
                                  <button
                                    className="text-sm text-slate-200 hover:text-red-400 hover:bg-red-500/10 text-left w-full transition-colors duration-200 p-2 rounded-lg flex items-center gap-2"
                                    title="Delete for Everyone"
                                    onClick={() => {
                                      handleDeleteForEveryone(msg._id);
                                    }}
                                  >
                                    <FiUserX className="w-4 h-4" />
                                    Delete for Everyone
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            {msg.attachments &&
                              msg.attachments.length > 0 &&
                              msg.attachments.map((url, idx) => {
                                const extension = url
                                  .split(".")
                                  .pop()
                                  .split("?")[0]
                                  .toLowerCase();
                                const isImage = [
                                  "jpg",
                                  "jpeg",
                                  "png",
                                  "gif",
                                  "webp",
                                ].includes(extension);
                                const isVideo = ["mp4", "webm", "ogg"].includes(
                                  extension
                                );
                                const fileName = url
                                  .split("/")
                                  .pop()
                                  .split("?")[0];

                                if (isImage) {
                                  return (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt="attachment"
                                      className="rounded-xl max-w-xs max-h-60 shadow-lg transition-all duration-200 hover:shadow-xl"
                                    />
                                  );
                                }

                                if (isVideo) {
                                  return (
                                    <video
                                      key={idx}
                                      src={url}
                                      controls
                                      className="rounded-xl max-w-xs max-h-40 shadow-lg"
                                    />
                                  );
                                }

                                // File attachment with smooth styling
                                return (
                                  <div
                                    key={idx}
                                    className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-3 w-64 shadow-lg flex items-center gap-3 mt-2 hover:bg-slate-700/60 transition-all duration-200"
                                  >
                                    <div className="bg-blue-600/20 p-2 rounded-xl">
                                      <FiPaperclip className="text-blue-400 w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-slate-100 truncate max-w-[150px]">
                                        {fileName}
                                      </span>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                                      >
                                        Open File
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}

                            <div className="flex flex-col gap-1">
                              <div className="flex flex-row gap-3 justify-between">
                                {/* Show text or empty spacer to push tick to the right */}
                                {msg.text ? (
                                  <div
                                    className={`text-sm leading-relaxed ${
                                      isDeleted ? "italic text-slate-400" : ""
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                ) : (
                                  <div className="w-1"></div> // 👈 Spacer when there's no text
                                )}
                              </div>
                              <div
                                className={`${
                                  isSentByUser
                                    ? "flex flex-row justify-end gap-2"
                                    : ""
                                }`}
                              >
                                {/* Message timestamp */}
                                <div
                                  className={`text-xs ${
                                    isDeleted
                                      ? isSentByUser
                                        ? "text-slate-500 text-right"
                                        : "text-slate-500 text-left"
                                      : isSentByUser
                                      ? "text-blue-200 text-right"
                                      : "text-slate-400 text-left"
                                  }`}
                                >
                                  {new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                                </div>

                                {/* Tick for sent messages */}
                                {isSentByUser &&
                                  selectedChat?.otherUser?._id && (
                                    <div className="text-xs flex items-center justify-end gap-1">
                                      {(() => {
                                        const readBy = msg.readBy || [];
                                        const deliveredTo =
                                          msg.deliveredTo || [];
                                        const otherUserId =
                                          selectedChat.otherUser._id;

                                        if (readBy.includes(otherUserId)) {
                                          // Message has been read
                                          return (
                                            <IoCheckmarkDoneSharp className="text-green-400 text-lg" />
                                          );
                                        } else if (
                                          deliveredTo.includes(otherUserId)
                                        ) {
                                          // Message delivered but not read
                                          return (
                                            <IoCheckmarkDoneSharp className="text-slate-300 text-lg" />
                                          );
                                        } else {
                                          // Not delivered yet
                                          return (
                                            <IoCheckmarkSharp className="text-slate-400 text-lg" />
                                          );
                                        }
                                      })()}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
            ) : (
              <div className="text-center text-slate-400 py-8">
                <div className="text-6xl mb-4 opacity-30">💬</div>
                <p>No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="absolute bottom-16 left-4 w-72 z-20 bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-600/50">
            <button
              onClick={() => {
                setFile(null);
                setFilePreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              title="Remove File"
              className="absolute top-1 right-1 p-1.5 rounded-full hover:bg-slate-700/50 transition-all duration-200"
            >
              <FiX className="w-4 h-4 text-slate-400 hover:text-slate-200 transition-colors duration-200" />
            </button>
            <div className="w-full h-auto p-2 rounded-xl mb-3">
              {Loading && (
                <div className="absolute top-[42%] left-[42%]">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {file?.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-auto object-cover rounded-xl shadow-lg"
                />
              ) : file?.type.startsWith("video/") ? (
                <video
                  src={filePreview}
                  controls
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              ) : file?.type === "application/pdf" ? (
                <iframe
                  src={filePreview}
                  title="PDF Preview"
                  className="w-full h-64 rounded-xl shadow-lg"
                />
              ) : file?.type.startsWith("text/") ? (
                <div className="overflow-y-auto max-h-64 text-sm text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-3 rounded-xl">
                  <pre>
                    {(() => {
                      const [text, setText] = React.useState("Loading...");
                      React.useEffect(() => {
                        file.text().then(setText);
                      }, [file]);
                      return text;
                    })()}
                  </pre>
                </div>
              ) : (
                <div className="text-sm text-slate-400 text-center p-4">
                  Preview not supported for this file type.
                </div>
              )}
            </div>
            <div className="w-full flex items-center gap-2">
              <button
                className="text-xl hover:scale-110 transition-transform duration-200"
                onClick={() => setShowEmojiPicker((val) => !val)}
              >
                😊
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-0 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 p-3 text-sm text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-700/50 border border-slate-600/50 placeholder-slate-400 transition-all duration-200"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);

                  if (!socket || !selectedChat) return;

                  socket.emit("typing", {
                    chatId: selectedChat._id,
                    user: user,
                  });

                  // Clear previous timer and start new one
                  if (typingTimeout.current)
                    clearTimeout(typingTimeout.current);
                  typingTimeout.current = setTimeout(() => {
                    socket.emit("stop-typing", {
                      chatId: selectedChat._id,
                      user: user,
                    });
                  }, 1500);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    handleSendMessage();
                  }
                }}
                onClick={() => setShowEmojiPicker(false)}
              />
              <button
                title="Send"
                className="text-blue-400 hover:text-blue-300 p-2 rounded-xl hover:bg-blue-500/10 transition-all duration-200 hover:scale-110"
                onClick={handleSendMessage}
                disabled={!message.trim() && !file}
              >
                <IoMdSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 3️⃣ Input (sticky at bottom) */}
        <div className="sticky bottom-0 z-10 bg-slate-800/80 backdrop-blur-md px-4 py-4 border-t border-slate-700/50 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <button
              className="text-xl hover:scale-110 transition-transform duration-200"
              onClick={() => setShowEmojiPicker((val) => !val)}
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <input
              type="file"
              id="fileInput"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile && selectedFile instanceof Blob) {
                  setFile(selectedFile);
                  setFilePreview(URL.createObjectURL(selectedFile));
                } else {
                  console.error("Invalid file:", selectedFile);
                }
              }}
            />
            <label
              htmlFor="fileInput"
              className="p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
            >
              <FiPaperclip className="text-xl text-slate-400 hover:text-slate-200 transition-colors duration-200" />
            </label>
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-3 text-sm text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-700/50 border border-slate-600/50 placeholder-slate-400 transition-all duration-200"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);

                if (!socket || !selectedChat) return;

                socket.emit("typing", {
                  chatId: selectedChat._id,
                  user: user,
                });

                // Clear previous timer and start new one
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => {
                  socket.emit("stop-typing", {
                    chatId: selectedChat._id,
                    user: user,
                  });
                }, 1500);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  handleSendMessage();
                }
              }}
              onClick={() => setShowEmojiPicker(false)}
            />
            <button
              title="Send"
              className="text-blue-400 hover:text-blue-300 p-2 rounded-xl hover:bg-blue-500/10 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={handleSendMessage}
              disabled={!message.trim() && !file}
            >
              <IoMdSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <ChatDetail
        showDetail={showDetail}
        onClose={onClose}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default Chatbox;
