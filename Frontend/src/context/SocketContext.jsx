// src/context/SocketContext.js
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import {
  updateUserStatus,
  updateOtherUserDetails,
} from "../features/chat/chatSlice";
import { updateUserStatus as updateUserStatusRedux } from "../features/auth/authSlice";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ userId, children }) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null); // ✅ So we don't expose null
  const getSocketURL = () => {
    if (import.meta.env.DEV) {
      return "http://localhost:3000"; // or wherever your dev server runs
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      throw new Error(
        "VITE_SOCKET_URL environment variable is required in production"
      );
    }

    return socketUrl;
  };

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(getSocketURL(), {
      query: { userId },
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance); // ✅ context value won't be null anymore

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
    });

    socketInstance.on("setup", () => {
      console.log("✅ Setup complete for user:", userId);
    });

    socketInstance.on("online-users", (users) => {
      console.log("🟢 Online users:", users);
      dispatch(updateUserStatus(users)); // ✅ Update Redux
      dispatch(updateUserStatusRedux(users)); // ✅ Update auth status
    });

    socketInstance.on("Update-user", (data) => {
      dispatch(updateOtherUserDetails(data));
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
