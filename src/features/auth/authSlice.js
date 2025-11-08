// src/features/auth/authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiLogin, apiRegister } from "../../services/authApi";
import { attachOrdersToUserByEmail } from "../../services/orderApi";

const LOCAL_KEY = "currentUser";

// -------- Thunks --------
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const user = await apiRegister(payload);

      try {
        await attachOrdersToUserByEmail(user.email, user.id, user.name);
      } catch (err2) {
        console.warn("Không thể gom đơn guest sau khi đăng ký:", err2?.message);
      }

      return user;
    } catch (err) {
      return rejectWithValue(err?.message || "Đăng ký thất bại");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const user = await apiLogin(payload);

      try {
        await attachOrdersToUserByEmail(user.email, user.id, user.name);
      } catch (err2) {
        console.warn(
          "Không thể gom đơn guest sau khi đăng nhập:",
          err2?.message
        );
      }

      return user;
    } catch (err) {
      return rejectWithValue(err?.message || "Đăng nhập thất bại");
    }
  }
);

// -------- Slice --------
const initialState = {
  currentUser: (() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
    } catch {
      return null;
    }
  })(),
  loading: false,
  error: null,
  registeredJustNow: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.currentUser = null;
      localStorage.removeItem(LOCAL_KEY);
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFlags: (state) => {
      state.registeredJustNow = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s) => {
        s.loading = false;
        s.error = null;
        s.registeredJustNow = true;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Đăng ký thất bại";
      });

    builder
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.error = null;
        s.currentUser = a.payload;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(a.payload));
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Đăng nhập thất bại";
      });
  },
});

export const { logoutUser, clearError, clearFlags } = authSlice.actions;
export default authSlice.reducer;
