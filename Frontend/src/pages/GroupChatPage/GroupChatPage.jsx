import React from "react";
import { FaUsers, FaComments, FaHeart, FaRocket } from "react-icons/fa";
import TwoPanelLayout from "../../Layouts/TwoPanelLayout";

const LeftPanel = () => (
  <div className="ml-20 w-82 flex flex-col p-5 text-white h-full shadow-2xl rounded-lg justify-between bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700">
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaUsers className="text-4xl text-blue-400" />
        <h2 className="text-3xl font-bold text-blue-100">Group Chat</h2>
      </div>

      <p className="text-sm leading-relaxed text-slate-300 mb-6">
        <strong className="text-lg text-blue-100">Coming Soon!</strong> Group
        chat functionality is currently in development.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <FaComments className="text-blue-400" />
          <span className="text-sm text-slate-300">Real-time messaging</span>
        </div>
      </div>
    </div>

    <div className="mt-8 text-sm text-center pt-4 border-t border-slate-600 text-slate-400">
      Built with <FaHeart className="inline text-red-500 mx-1" /> by Projita
    </div>
  </div>
);

const RightPanel = () => (
  <div className="h-full m-5 px-8 py-6 text-white rounded-lg flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700">
    {/* Hero Section */}
    <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto text-center">
      {/* Main Icon */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
          <FaUsers className="text-4xl text-white" />
        </div>
        <h1 className="text-5xl font-bold text-blue-100 mb-4">
          Group Chat
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Create and manage group conversations with your team
        </p>
      </div>

      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8 shadow-lg">
        <FaRocket className="text-2xl" />
        <span className="font-semibold text-lg">Coming Soon</span>
      </div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
        <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-600">
          <FaUsers className="text-blue-400 text-2xl mb-2" />
          <h3 className="font-semibold text-blue-100 mb-1">Group Creation</h3>
          <p className="text-sm text-slate-300">Create and manage groups easily</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-600">
          <FaComments className="text-blue-400 text-2xl mb-2" />
          <h3 className="font-semibold text-blue-100 mb-1">Group Messaging</h3>
          <p className="text-sm text-slate-300">Chat with multiple people at once</p>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-200"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-400"></div>
        <span className="text-sm ml-3">Development in progress...</span>
      </div>
    </div>
  </div>
);

const GroupChatPage = () => (
  <TwoPanelLayout left={<LeftPanel />} right={<RightPanel />} />
);

export default GroupChatPage;