import React from "react";
import { FiUser, FiPhone, FiMail, FiInfo, FiX } from "react-icons/fi";
import formatTimeAgo from "../../utils/formatTimeAgo";

const ChatDetail = ({ showDetail, onClose, selectedChat }) => {
  return (
    <div
      className={`absolute top-0 right-0 h-full w-80 z-30 flex flex-col p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl rounded-lg overflow-hidden border border-slate-700/50
        transform transition-all duration-300 ease-in-out
        ${
          showDetail
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold tracking-wide text-blue-100">Chat Info</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-700/50 transition cursor-pointer"
        >
          <FiX className="w-5 h-5 text-slate-400 hover:text-slate-200 transition" />
        </button>
      </div>

      {/* User Profile */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={
            selectedChat?.otherUser?.profilePic ||
            "https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg"
          }
          alt="User"
          className="w-24 h-24 rounded-full object-cover shadow-md mb-3 ring-2 ring-blue-500/30"
        />
        <div className="text-xl font-semibold text-blue-100">
          {selectedChat?.otherUser?.username || "Username"}
        </div>
        <div className="text-sm text-green-400">
          {selectedChat?.otherUser?.status === "online"
            ? "online"
            : selectedChat?.otherUser?.lastSeen
            ? `last seen ${formatTimeAgo(selectedChat.otherUser.lastSeen)}`
            : "offline"}
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-4 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <FiUser className="text-slate-400" />
          <span>
            Username:{" "}
            <span className="font-medium text-slate-100">
              {selectedChat?.otherUser?.username}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FiMail className="text-slate-400" />
          <span>
            Email:{" "}
            <span className="font-medium text-slate-100">
              {selectedChat?.otherUser?.email || "Not available"}
            </span>
          </span>
        </div>
        {selectedChat?.otherUser?.bio && (
          <div className="flex items-start gap-3">
            <FiInfo className="text-slate-400 mt-1" />
            <span className="leading-snug">
              <strong className="text-slate-100">Bio:</strong> {selectedChat.otherUser.bio}
            </span>
          </div>
        )}
        <div className="flex items-start gap-3">
          <FiInfo className="text-slate-400 mt-1" />
          <span className="leading-snug">
            This is a direct chat between you and{" "}
            <strong className="text-slate-100">{selectedChat?.otherUser?.username}</strong>. You can share
            files, chat history remains secure.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;