// src/services/categoryApi.js
import { api } from "../lib/axios";

const BASE_PATH = "/categories";

export const getCategories = async () => {
  const res = await api.get(BASE_PATH);
  return Array.isArray(res.data) ? res.data : [];
};

export const createCategory = async (payload) => {
  const body = {
    id: payload.id || String(Date.now()),
    name: payload.name?.trim() || "Danh mục chưa đặt tên",
  };
  const res = await api.post(BASE_PATH, body);
  return res.data;
};

export const updateCategory = async (id, payload) => {
  const res = await api.patch(`${BASE_PATH}/${id}`, payload);
  return res.data;
};

export const deleteCategory = async (id) => {
  await api.delete(`${BASE_PATH}/${id}`);
};
