import React from "react";
import {
  FaUserCircle,
  FaReact,
  FaNodeJs,
  FaGithub,
  FaBolt,
  FaHeart,
  FaCode,
  FaDatabase,
  FaUsers,
  FaRocket,
  FaChartLine,
  FaComments,
  FaLightbulb,
} from "react-icons/fa";
import { SiSocketdotio, SiMongodb, SiTailwindcss,SiExpress } from "react-icons/si";
import TwoPanelLayout from "../../Layouts/TwoPanelLayout";

const LeftPanel = () => (
  <div className="ml-20 w-82 flex flex-col p-5 text-white h-full shadow-2xl rounded-lg justify-between bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700">
    <div>
      <h2 className="text-3xl font-bold mb-6 text-blue-100">
        About
      </h2>
      <p className="text-sm leading-relaxed text-slate-300">
        <strong className="text-lg text-blue-100">PingMe</strong> is a real-time chat application built for
        learning, experimenting, and showcasing full-stack capabilities. From
        frontend interactivity to backend performance — it's all custom-built.
      </p>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2 text-blue-100">
          Created By
        </h3>
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-3xl text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-100">Projita Kar</p>
            <p className="text-xs text-slate-400">BTech CSE @ IEM, 2026</p>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-8 text-sm text-center pt-4 border-t border-slate-600 text-slate-400">
      Built with <FaHeart className="inline text-red-500 mx-1" /> by Projita
    </div>
  </div>
);

const RightPanel = () => (
  <div className="h-full m-5 px-8 py-6 text-white rounded-lg flex flex-col overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700">
    
    {/* Features Box */}
    <div className="p-4 rounded-lg mb-6 bg-slate-800/80">
      <h3 className="text-xl font-semibold mb-4 text-blue-100">🚀 Features</h3>
      <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
        <li>Real-time messaging using WebSockets</li>
        <li>Group & private chats</li>
        <li>Typing indicators and read receipts</li>
        <li>Modern UI with Tailwind CSS</li>
        <li>Chat search, message status, and media support</li>
      </ul>
    </div>

    {/* Tech Stack Box */}
    <div className="p-4 rounded-lg mb-6 bg-slate-700/80">
      <h3 className="text-xl font-semibold mb-4 text-blue-100">
        🛠️ Tech Stack
      </h3>
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50">
          <FaReact className="text-blue-400" /> 
          <span className="text-blue-100">React</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50">
          <FaNodeJs className="text-blue-400" /> 
          <span className="text-blue-100">Node.js</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50">
          <SiSocketdotio className="text-blue-400" /> 
          <span className="text-blue-100">Socket.IO</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50">
          <SiMongodb className="text-blue-400" /> 
          <span className="text-blue-100">MongoDB</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50">
          <SiTailwindcss className="text-blue-400" /> 
          <span className="text-blue-100">Tailwind CSS</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50">
          <SiExpress className="text-blue-400" /> 
          <span className="text-blue-100">Express js</span>
        </div>
      </div>
    </div>

    {/* What I Learned Box */}
    <div className="p-4 rounded-lg mb-6 bg-slate-800/80">
      <h3 className="text-xl font-semibold mb-4 text-blue-100">
        📚 What I Learned
      </h3>
      <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
        <li>WebSocket integration with Socket.IO</li>
        <li>State management using Redux Toolkit</li>
        <li>Secure user auth with JWT</li>
        <li>Responsive and theme-consistent UI</li>
      </ul>
    </div>

    {/* Links Box */}
    <div className="p-4 rounded-lg bg-slate-700/80">
      <h3 className="text-xl font-semibold mb-4 text-blue-100">🔗 Links</h3>
      <div className="flex gap-4">
        <a
          href="https://github.com/PROJITAKAR"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-opacity bg-slate-900/50 text-blue-100"
        >
          <FaGithub className="text-blue-400" /> GitHub Repo
        </a>
        <a
          href="https://pingme-live-link.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-opacity bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          <FaBolt /> Live Demo
        </a>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <TwoPanelLayout left={<LeftPanel />} right={<RightPanel />} />
);

export default AboutPage;