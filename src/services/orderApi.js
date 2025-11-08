// src/services/orderApi.js
import { api } from "../lib/axios"; // dùng axios instance đã cấu hình ENV

// Dùng path thay vì hard-code BASE_URL
const ORDERS_PATH = "/orders";
const CART_PATH = "/cart";
const PRODUCTS_PATH = "/products";

const CLIENT_TO_SERVER_STATUS = {
  pending: "Đang xử lý",
  processing: "Đang giao",
  completed: "Hoàn thành",
  canceled: "Đã huỷ",
};

const SERVER_TO_CLIENT_STATUS = {
  "Đang xử lý": "pending",
  "Đang giao": "processing",
  "Hoàn thành": "completed",
  "Đã huỷ": "canceled",
};

const ensureStringId = (maybeId) => {
  if (!maybeId) return Date.now().toString();
  return typeof maybeId === "string" ? maybeId : String(maybeId);
};

const normalizeId = (id) => (typeof id === "number" ? id : String(id).trim());

const toClientStatus = (raw) => {
  if (!raw) return "pending";
  if (CLIENT_TO_SERVER_STATUS[raw]) return raw;
  if (SERVER_TO_CLIENT_STATUS[raw]) return SERVER_TO_CLIENT_STATUS[raw];
  return "pending";
};

const toServerStatus = (raw) => {
  if (!raw) return "Đang xử lý";
  if (CLIENT_TO_SERVER_STATUS[raw]) return CLIENT_TO_SERVER_STATUS[raw];
  return raw;
};

export const getOrders = async () => {
  const res = await api.get(ORDERS_PATH);
  const data = Array.isArray(res.data) ? res.data : [];
  return data
    .map((o) => ({
      ...o,
      status: toClientStatus(o.status),
    }))
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return Number(b.id || 0) - Number(a.id || 0);
    });
};

export const createOrderAndUpdateStock = async (orderData) => {
  const fixedId = ensureStringId(orderData.id);
  const serverStatus = toServerStatus(orderData.status);
  const paymentMethod = orderData.paymentMethod || "cod";
  const paymentStatus =
    orderData.paymentStatus || (paymentMethod === "cod" ? "unpaid" : "pending");

  const createdRes = await api.post(ORDERS_PATH, {
    ...orderData,
    id: fixedId,
    createdAt: orderData.createdAt || new Date().toISOString(),
    status: serverStatus,
    paymentMethod,
    paymentStatus,
  });

  const createdOrder = createdRes.data;

  // Giảm tồn kho theo items (nếu có)
  if (Array.isArray(orderData.items)) {
    for (const item of orderData.items) {
      try {
        const prodRes = await api.get(`${PRODUCTS_PATH}/${item.id}`);
        const product = prodRes.data;
        if (!product || product.id == null) continue;
        const currentStock = Number(product.stock ?? 0);
        const qty = Number(item.quantity || 0);
        const newStock = Math.max(0, currentStock - qty);
        await api.patch(`${PRODUCTS_PATH}/${item.id}`, { stock: newStock });
      } catch (err) {
        console.error("Giảm tồn kho thất bại cho id:", item.id, err);
      }
    }
  }

  return {
    ...createdOrder,
    status: toClientStatus(createdOrder.status),
  };
};

export const clearCart = async () => {
  const res = await api.get(CART_PATH);
  const items = Array.isArray(res.data) ? res.data : [];
  if (!items.length) return;
  await Promise.all(items.map((it) => api.delete(`${CART_PATH}/${it.id}`)));
};

export const updateOrder = async (id, payload = {}) => {
  const normIdStr = ensureStringId(id);
  const payloadForServer = {
    ...payload,
    ...(payload.status ? { status: toServerStatus(payload.status) } : {}),
  };

  const patchById = async (realId) => {
    const res = await api.patch(`${ORDERS_PATH}/${realId}`, payloadForServer);
    const serverData = res.data;
    return { ...serverData, status: toClientStatus(serverData.status) };
  };

  try {
    return await patchById(normIdStr);
  } catch (err) {
    console.warn(
      "[orderApi.updateOrder] PATCH lỗi, thử GET+PUT:",
      err?.message
    );
    try {
      const oldRes = await api.get(`${ORDERS_PATH}/${normIdStr}`);
      const merged = { ...oldRes.data, ...payloadForServer };
      const putRes = await api.put(`${ORDERS_PATH}/${normIdStr}`, merged);
      const serverData = putRes.data;
      return { ...serverData, status: toClientStatus(serverData.status) };
    } catch (err2) {
      console.warn(
        "[orderApi.updateOrder] GET/PUT cũng lỗi, khả năng cao id trong db hiện đang là number:",
        err2?.message
      );
      try {
        const numId = Number(id);
        if (!Number.isNaN(numId)) {
          const res = await api.patch(
            `${ORDERS_PATH}/${numId}`,
            payloadForServer
          );
          const serverData = res.data;
          return { ...serverData, status: toClientStatus(serverData.status) };
        }
      } catch (err3) {
        console.warn(
          "[orderApi.updateOrder] PATCH với number cũng lỗi:",
          err3?.message
        );
      }
      throw err2;
    }
  }
};

export const getOrdersByEmail = async (email) => {
  if (!email) return [];
  const all = await getOrders();
  const lower = email.trim().toLowerCase();
  return all.filter(
    (o) => (o.customerEmail || "").trim().toLowerCase() === lower
  );
};

export const getOrdersByKeyword = async (keyword = "", status = "") => {
  const all = await getOrders();
  const kw = keyword.trim().toLowerCase();
  const statusEn = status ? toClientStatus(status) : "";

  return all.filter((o) => {
    const matchKw = kw ? String(o.id).toLowerCase().includes(kw) : true;
    const matchStatus = statusEn ? o.status === statusEn : true;
    return matchKw && matchStatus;
  });
};

export const attachOrdersToUserByEmail = async (email, userId, userName) => {
  if (!email || !userId) return;
  const res = await api.get(ORDERS_PATH);
  const all = Array.isArray(res.data) ? res.data : [];
  const lower = email.trim().toLowerCase();

  const target = all.filter((o) => {
    const sameEmail = (o.customerEmail || "").trim().toLowerCase() === lower;
    const isGuest =
      !o.customerId ||
      String(o.customerId).startsWith("guest-") ||
      o.customerId === "";
    return sameEmail && isGuest;
  });

  if (!target.length) return;

  await Promise.all(
    target.map((o) =>
      api.patch(`${ORDERS_PATH}/${o.id}`, {
        customerId: userId,
        customerName: o.customerName || userName || "Người dùng",
      })
    )
  );
};
