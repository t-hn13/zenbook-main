// src/features/user/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const stored = localStorage.getItem("auth");
const initialState = stored
  ? JSON.parse(stored)
  : { isAuth: false, profile: null };

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuth = true;
      state.profile = action.payload;
      localStorage.setItem("auth", JSON.stringify(state));
    },
    logout(state) {
      state.isAuth = false;
      state.profile = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { loginSuccess, logout } = slice.actions;
export default slice.reducer;
