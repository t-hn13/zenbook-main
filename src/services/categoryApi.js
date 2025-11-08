// src/services/categoryApi.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/categories";

export const getCategories = async () => {
  const res = await axios.get(BASE_URL);
  return Array.isArray(res.data) ? res.data : [];
};

export const createCategory = async (payload) => {
  const body = {
    id: payload.id || String(Date.now()),
    name: payload.name?.trim() || "Danh mục chưa đặt tên",
  };
  const res = await axios.post(BASE_URL, body);
  return res.data;
};

export const updateCategory = async (id, payload) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, payload);
  return res.data;
};

export const deleteCategory = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};
