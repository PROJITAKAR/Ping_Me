import React from "react";
import Navbar from "../components/NavBar/Navbar";

const TwoPanelLayout = ({ left, right }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-[#030018]">
      <Navbar />
      <div className="flex-1 flex flex-row justify-center items-center h-screen overflow-hidden">
        <div className="h-full flex flex-col px-4 py-6 overflow-hidden mb-10">
          <span className="ml-22 text-xl font-bold tracking-wide mt-1 mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            PingMe
          </span>
          <div className="flex-1 h-full rounded-lg">
            {left}
          </div>
        </div>
        <div className="flex-1 h-full pb-10">
          {right}
        </div>
      </div>
    </div>
  );
};

export default TwoPanelLayout;
