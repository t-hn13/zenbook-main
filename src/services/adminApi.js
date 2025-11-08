// src/services/adminApi.js
import { api } from "../lib/axios";

export const getAdminStats = async () => {
  try {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      api.get("/products"),
      api.get("/orders"),
      api.get("/users"),
    ]);
    return {
      products: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
      orders: Array.isArray(ordersRes.data) ? ordersRes.data.length : 0,
      users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
    };
  } catch (e) {
    console.error("[adminApi.getAdminStats] error:", e);
    return { products: 0, orders: 0, users: 0 };
  }
};
