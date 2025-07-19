import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { isLoggedIn, Loading } = useSelector((state) => state.auth);

  if (Loading) return null; 
  return isLoggedIn ? <Navigate to="/chats" /> : children;
};

export default PublicRoute;
