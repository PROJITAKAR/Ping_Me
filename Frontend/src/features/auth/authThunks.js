import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post("/api/auth/login", credentials, {
        withCredentials: true,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Login failed"]
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post("/api/auth/register", credentials, {
        withCredentials: true,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Registration failed"]
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const res = await axios.post("/api/auth/logout", {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Logout failed"]
      );
    }
  }
);

export const getMe = createAsyncThunk("auth/getMe", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/api/auth/me", {
      withCredentials: true,
    });
    return res.data.data;
  } catch (error) {
    // If user is not logged in, 401 is expected — just return null
    if (error.response?.status === 401) {
      return thunkAPI.rejectWithValue(null);
    }

    return thunkAPI.rejectWithValue(
      error.response?.data?.errors || ["Failed to get user"]
    );
  }
});

export const updateProfilepic = createAsyncThunk(
  "auth/updateProfilepic",
  async (data, thunkAPI) => {
    try {
      const res = await axios.patch("/api/user/updateProfilepic", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to update profile picture"]
      );
    }
  }
);

export const updateBio = createAsyncThunk(
  "auth/updateBio",
  async (data, thunkAPI) => {
    try {
      const res = await axios.patch("/api/user/updateBio", data, {
        withCredentials: true,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to update bio"]
      );
    }
  }
);

export const updateUsername = createAsyncThunk(
  "auth/updateUsername",
  async (data, thunkAPI) => {
    try {
      const res = await axios.patch("/api/user/updateUsername", data, {
        withCredentials: true,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errors || ["Failed to update username"]
      );
    }
  }
);
