// src/services/brandApi.js
import { api } from "../lib/axios";

const BASE_PATH = "/brands";

export const getBrands = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

export const createBrand = async (name) => {
  const res = await api.post(BASE_PATH, { name });
  return res.data;
};

export const updateBrand = async (id, name) => {
  const res = await api.patch(`${BASE_PATH}/${id}`, { name });
  return res.data;
};

export const deleteBrand = async (id) => {
  await api.delete(`${BASE_PATH}/${id}`);
};
