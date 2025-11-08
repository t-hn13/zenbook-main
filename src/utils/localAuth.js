// src/utils/localAuth.js
// Đây là nơi lưu tài khoản người dùng khi đăng nhập ở trên trình duyệt lưu ở localstorage
const USERS_KEY = "zenbooks_users";
const CURRENT_USER_KEY = "zenbooks_current_user";
export const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};
export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
