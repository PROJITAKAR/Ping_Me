import React from "react";
import { useState } from "react";
import {
  IoChatbubbleEllipsesOutline,
  IoLogOutOutline,
  IoPersonOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { FaBars } from "react-icons/fa6";
import { MdOutlineGroups } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authThunks";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FiUserPlus } from "react-icons/fi";
import {clearChatState } from "../../features/chat/chatSlice"


const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleToggle = () => {
    setToggle(!toggle);
  };

  const handleLogout = async() =>{
    const response = await dispatch(logoutUser());
    if(logoutUser.fulfilled.match(response))
    {
      dispatch(clearChatState());
      toast.success("Logout Successfully");
      navigate('/login')
    } else {
      toast.error("Error");
    }
  }

  return (
    <div
      className={`fixed top-0 left-0 z-50 flex flex-col justify-between items-start p-6 bg-[#030018]
 text-white h-screen shadow-2xl overflow-hidden transform ${
   toggle ? "w-64" : "w-20"
 } transition-transform duration-300 ease-in-out`}
    >
      <div>
        <div className="flex flex-row items-start gap-6 relative z-10 mb-10">
          <button onClick={handleToggle} className="text-2xl cursor-pointer">
            <FaBars className="text-2xl cursor-pointer" />
          </button>
          {toggle && (
            <span className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              PingMe
            </span>
          )}
        </div>
        <div>
          <Link
            to="/chats"
            className="flex flex-row items-center gap-6 relative z-10 mt-6"
          >
            <div>
              <IoChatbubbleEllipsesOutline className="text-2xl cursor-pointer" />
            </div>
            {toggle && <span className=" font-medium text-white ">Chats</span>}
          </Link>
        </div>
        <div>
          <Link
            to="/chats/search"
            className="flex flex-row items-center gap-6 relative z-10 mt-6"
          >
            <div>
              <FiUserPlus  className="text-2xl cursor-pointer" />
            </div>
            {toggle && (
              <span className=" font-medium text-white ">Contacts</span>
            )}
          </Link>
        </div>
        <div>
          <Link
            to="/chats/profile"
            className="flex flex-row items-center gap-6 relative z-10 mt-6"
          >
            <div>
              <IoPersonOutline  className="text-2xl cursor-pointer" />
            </div>
            {toggle && (
              <span className=" font-medium text-white ">Profile</span>
            )}
          </Link>
        </div>
        <div>
          <Link
            to="/help"
            className="flex flex-row items-center gap-6 relative z-10 mt-6"
          >
            <div>
              <IoHelpCircleOutline className="text-2xl cursor-pointer" />
            </div>
            {toggle && <span className=" font-medium text-white ">Help</span>}
          </Link>
        </div>
        <div>
          <Link
            to="/about"
            className="flex flex-row items-center gap-6 relative z-10 mt-6"
          >
            <div>
              <IoInformationCircleOutline className="text-2xl cursor-pointer" />
            </div>
            {toggle && <span className=" font-medium text-white ">About</span>}
          </Link>
        </div>
        <div>
          <Link
            to="/groups"
            className="flex flex-row items-center gap-6 relative z-10 mt-6"
          >
            <div>
              <MdOutlineGroups className="text-2xl cursor-pointer" />
            </div>
            {toggle && <span className=" font-medium text-white ">Groups</span>}
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-start justify-center w-full">
        {/* User Profile Section */}
        <div className="flex flex-row items-center gap-6 justify-center mt-6">
          {/* Avatar with enhanced styling */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-1 shadow-lg">
              <img
                src={user?.profilePic || "https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-2 border-white border-opacity-20"
              />
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
          </div>

          {/* Username */}
          {toggle && (
            <div >
              <h3 className="text-xl font-semibold text-white">{user.username}</h3>
              <p className="text-blue-200 text-sm ">{user.status}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex items-center gap-6 justify-center mt-6">
          <button onClick={handleLogout} className="flex items-center gap-6 text-[#030018] ">
            <div className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105 border border-white border-opacity-20 backdrop-blur-sm">
              <IoLogOutOutline className="text-2xl cursor-pointer" />
            </div>
            {toggle && <span className=" font-medium text-white ">Logout</span>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
