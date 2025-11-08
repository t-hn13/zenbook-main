// src/services/authApi.js
import { api } from "../lib/axios";

const BASE_PATH = "/users";

const isGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email || "");

export const emailExists = async (email) => {
  const res = await api.get(BASE_PATH, {
    params: { email: email?.trim().toLowerCase() },
  });
  return (res.data?.length || 0) > 0;
};

export const apiRegister = async ({ name, email, password }) => {
  if (!isGmail(email))
    throw new Error("Email không hợp lệ. Chỉ chấp nhận Gmail.");
  if (await emailExists(email)) throw new Error("Email đã được sử dụng.");

  const payload = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  const res = await api.post(BASE_PATH, payload);
  return res.data;
};

export const apiLogin = async ({ email, password }) => {
  const res = await api.get(BASE_PATH, {
    params: { email: email?.trim().toLowerCase() },
  });

  const user = res.data?.[0];
  if (!user) throw new Error("Không tìm thấy tài khoản.");
  if (user.password !== password) throw new Error("Mật khẩu không đúng.");

  return user;
};
