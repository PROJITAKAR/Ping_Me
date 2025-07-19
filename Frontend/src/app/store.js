import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import userReducer from '../features/user/userSlice'; // Import the user reducer

const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        user: userReducer, // Add the user reducer to the store
    }
});

export default store;