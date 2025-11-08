// src/services/brandApi.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/brands";

export const getBrands = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const createBrand = async (name) => {
  const res = await axios.post(BASE_URL, { name });
  return res.data;
};

export const updateBrand = async (id, name) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, { name });
  return res.data;
};

export const deleteBrand = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};
