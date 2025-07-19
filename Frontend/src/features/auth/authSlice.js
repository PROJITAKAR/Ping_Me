import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
  updateProfilepic,
  updateBio,
  updateUsername
} from "../auth/authThunks";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    Loading: false,
    updatingDetails: false,
    error: null,
    isLoggedIn: false,
  },
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateUserStatus: (state, action) => {
      const onlineUsers = action.payload;
      if (state.user && state.user._id) {
        const isUserOnline = onlineUsers.includes(state.user._id.toString());
        state.user.status = isUserOnline ? "online" : "offline";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.Loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.Loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.Loading = false;
      })

      .addCase(registerUser.pending, (state) => {
        state.Loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.Loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
        state.Loading = false;
      })

      .addCase(logoutUser.pending, (state) => {
        state.Loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.Loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        state.Loading = false;
      })

      .addCase(getMe.pending, (state) => {
        state.Loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.Loading = false;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoggedIn = false;
        state.Loading = false;
      })
      .addCase(updateProfilepic.pending, (state) => {
        state.updatingDetails = true;
      })
      .addCase(updateProfilepic.fulfilled, (state, action) => {
        state.user.profilePic = action.payload.profilePic;
        state.updatingDetails = false;
        state.error = null;
      })
      .addCase(updateProfilepic.rejected, (state, action) => {
        state.error = action.payload;
        state.updatingDetails = false;
      })
      .addCase(updateBio.pending,(state)=>{
        state.updatingDetails = true;
      })
      .addCase(updateBio.fulfilled,(state,action)=>{
        state.user.bio= action.payload.bio;
        state.updatingDetails = false;
        state.error = null;
      })
      .addCase(updateBio.rejected, (state, action) => {
        state.error = action.payload;
        state.updatingDetails = false;
      })
      .addCase(updateUsername.pending, (state) => {
        state.updatingDetails = true;
      })
      .addCase(updateUsername.fulfilled,(state,action)=>{
        state.user.username= action.payload.username;
        state.updatingDetails = false;
        state.error = null;
      })
      .addCase(updateUsername.rejected, (state, action) => {
        state.error = action.payload;
        state.updatingDetails = false;
      });
  },
});

export const { setError, updateUserStatus } = authSlice.actions;
export default authSlice.reducer;
