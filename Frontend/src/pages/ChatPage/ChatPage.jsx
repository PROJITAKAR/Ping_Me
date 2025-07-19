import React from "react";
import TwoPanelLayout from "../../Layouts/TwoPanelLayout";
import ChatList from "../../components/ChatList/ChatList";
import Chatbox from "../../components/Chatbox/Chatbox";

const ChatPage = () => {
  return <TwoPanelLayout left={<ChatList />} right={<Chatbox />} />;
};

export default ChatPage;
