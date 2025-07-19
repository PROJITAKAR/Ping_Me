import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./app/store.js";
import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return ''; 
  }
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL environment variable is required in production');
  }
  
  return backendUrl;
};

axios.defaults.baseURL = getBaseURL();
axios.defaults.withCredentials = true;


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
