import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatApp from "./pages/ChatApp/ChatApp";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ChatList from "./components/ChatList/ChatList";
import SearchContact from "./components/SearchContact/SearchContact";
import { useSelector } from "react-redux";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getMe } from "./features/auth/authThunks";
import { SocketProvider } from "./context/SocketContext";
import SocketEventsHandler from "./components/SocketEventsHandler/SocketEventsHandler";

import ChatPage from "./pages/ChatPage/ChatPage";
import SearchContactPage from "./pages/SearchContactPage/SearchContactPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import HelpPage from "./pages/HelpPage/HelpPage"
import AboutPage from "./pages/AboutPage/AboutPage"
import GroupChatPage from "./pages/GroupChatPage/GroupChatPage";

function App() {
  const { isLoggedIn, Loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getMe()); 
  }, [dispatch]);
  if (Loading)
    return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" />
      <SocketProvider userId={user?._id}>
        <SocketEventsHandler />
        {Loading ? (
          <p className="text-white text-center mt-10">Loading...</p>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Navigate to={isLoggedIn ? "/chats" : "/login"} />}
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
            path="/chats"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats/search"
            element={
              <PrivateRoute>
                <SearchContactPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PrivateRoute>
                <HelpPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PrivateRoute>
                <AboutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute>
                <GroupChatPage />
              </PrivateRoute>
            }
          />
          </Routes>
        )}
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
