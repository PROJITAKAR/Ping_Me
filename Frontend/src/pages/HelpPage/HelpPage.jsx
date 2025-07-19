import React, { useState } from "react";
import {
  FaSearch,
  FaQuestionCircle,
  FaRegCommentDots,
  FaUser,
  FaSignOutAlt,
  FaGlobe,
  FaChevronRight,
  FaEnvelope,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { TbSparkles as Sparkles } from "react-icons/tb";
import TwoPanelLayout from "../../Layouts/TwoPanelLayout";

const helpTopics = [
  {
    id: 1,
    title: "Getting Started",
    icon: <FaGlobe  />,
    content: "To begin using PingMe, go to the Chats tab and start a conversation...",
    tips: ["Set up your profile", "Import contacts", "Join groups", "Send your first message"],
  },
  {
    id: 2,
    title: "Profile Updates",
    icon: <FaUser  />,
    content: "Visit Profile to update username, bio, or photo...",
    tips: ["Use clear profile pic", "Keep a brief bio", "Use good username", "Update status"],
  },
  {
    id: 3,
    title: "Message Troubleshooting",
    icon: <FaRegCommentDots  />,
    content: "Check your internet. If issues persist, reload...",
    tips: ["Check internet", "Refresh", "Clear cache", "Contact support"],
  },
  {
    id: 4,
    title: "Logging Out",
    icon: <FaSignOutAlt  />,
    content: "Click logout in sidebar. Refresh if not working...",
    tips: ["Log out on shared PCs", "Data is saved", "You can log back in", "Use 'Remember Me' wisely"],
  },
];

const LeftPanelContent = ({ selectedId, onSelect, searchTerm, onSearchChange }) => (
  <div className="ml-20 w-82 flex flex-col p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full shadow-2xl rounded-lg overflow-hidden border border-slate-700">
    <h2 className="text-2xl font-bold mb-4 px-2 text-blue-100">Help Center</h2>

    {/* Search bar */}
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search help topics..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 placeholder-slate-400"
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
    </div>

    {/* Topic List */}
    <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
      <ul className="flex flex-col space-y-3">
        {helpTopics
          .filter(
            (t) =>
              t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((topic) => (
            <li
              key={topic.id}
              onClick={() => onSelect(topic)}
              className={`w-full px-4 py-3 rounded-xl cursor-pointer shadow-sm transition-all duration-200 border ${
                selectedId === topic.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500"
                  : "bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800/50 text-blue-400">
                  {topic.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-100">{topic.title}</h3>
                </div>
                <FaChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </li>
          ))}
      </ul>
    </div>

    <div className="text-center text-sm mt-4 text-slate-400">
      Need more help?{" "}
      <span className="hover:opacity-80 cursor-pointer font-medium text-blue-400">
        Contact Support
      </span>
    </div>
  </div>
);

const RightPanelContent = ({ topic }) => (
  <div className="h-full m-5 text-white rounded-lg p-6 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700">
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-blue-400">
          {topic.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-100">{topic.title}</h1>
          <div className="flex items-center gap-2 text-sm mt-1 text-slate-400">
            {/* <Sparkles className="w-4 h-4 text-yellow-400" /> */}
            Quick help guide
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-lg p-4 text-sm mb-16 bg-slate-700 border border-slate-600 text-slate-300">
      {topic.content}
    </div>

    {topic.tips && (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-100">
          {/* <Sparkles className="w-5 h-5 text-yellow-400" /> */}
          Quick Tips
        </h3>
        <ul className="space-y-2">
          {topic.tips.map((tip, idx) => (
            <li
              key={idx}
              className="p-3 rounded-lg text-sm flex items-start gap-3 bg-slate-700 border border-slate-600 text-slate-300"
            >
              <span className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="mt-auto text-sm text-center border-t pt-4 text-slate-400 border-slate-600">
      <FaEnvelope className="inline w-4 h-4 mr-1" />
      Still need help? Email{" "}
      <span className="hover:opacity-80 cursor-pointer font-medium text-blue-400">
        support@pingme.com
      </span>
    </div>
  </div>
);

const HelpPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(helpTopics[0]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <TwoPanelLayout
      left={
        <LeftPanelContent
          selectedId={selectedTopic.id}
          onSelect={setSelectedTopic}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      }
      right={<RightPanelContent topic={selectedTopic} />}
    />
  );
};

export default HelpPage;