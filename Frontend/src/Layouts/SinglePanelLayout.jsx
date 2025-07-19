import React from "react";
import Navbar from "../components/NavBar/Navbar";

const SinglePanelLayout = ({ children }) => {
  return (
    <div className="ml-20 flex flex-col h-screen bg-[#030018]">
      <Navbar />
      <div className="flex-1 overflow-hidden p-6">
        {children}
      </div>
    </div>
  );
};

export default SinglePanelLayout;
