// src/pages/user/Orders.jsx
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getOrders,
  getOrdersByEmail,
  getOrdersByKeyword,
} from "../../services/orderApi";

// Bản đồ trạng thái
const STATUS_LABELS = {
  pending: "Đang xử lý",
  processing: "Đang giao",
  completed: "Hoàn thành",
  canceled: "Đã huỷ",
};

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-600",
};

const VI_TO_EN = {
  "Đang xử lý": "pending",
  "Đang giao": "processing",
  "Hoàn thành": "completed",
  "Đã huỷ": "canceled",
  "Đã hủy": "canceled",
};

// Helper hiển thị tên phương thức thanh toán
const renderPayment = (order) => {
  if (!order) return "—";
  if (order.paymentMethodLabel) return order.paymentMethodLabel;
  if (order.paymentMethod === "cod") return "Thanh toán khi nhận hàng (COD)";
  if (order.paymentMethod === "pay_now") return "Thanh toán khi đặt hàng";
  return "Thanh toán khi nhận hàng (COD)";
};

const Orders = () => {
  const { currentUser } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [emailLookup, setEmailLookup] = useState("");
  const [codeLookup, setCodeLookup] = useState("");
  const [statusLookup, setStatusLookup] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Lấy đơn của người dùng đăng nhập
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      const data = await getOrders();
      const ownOrders = data
        .filter((o) => o.customerId === currentUser.id)
        .map((o) => {
          const raw = o.status;
          const normalized = STATUS_LABELS[raw]
            ? raw
            : VI_TO_EN[raw]
            ? VI_TO_EN[raw]
            : "pending";
          return {
            ...o,
            _statusKey: normalized,
            status: STATUS_LABELS[normalized] || "Đang xử lý",
          };
        });
      setOrders(ownOrders);
    };
    fetchOrders();
  }, [currentUser]);

  // Mở/Đóng Modal chi tiết đơn
  const openDetail = (order) => {
    const key = order._statusKey || VI_TO_EN[order.status] || "pending";
    setSelectedOrder({
      ...order,
      _statusKey: key,
      status: STATUS_LABELS[key] || order.status,
    });
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  // Tra cứu theo email
  const handleLookupByEmail = async (e) => {
    e.preventDefault();
    const email = emailLookup.trim().toLowerCase();
    if (!email) {
      alert("Nhập email để tra cứu");
      return;
    }
    try {
      setLookupLoading(true);
      const list = await getOrdersByEmail(email);
      const normalized = list.map((o) => {
        const key = STATUS_LABELS[o.status]
          ? o.status
          : VI_TO_EN[o.status] || "pending";
        return {
          ...o,
          _statusKey: key,
          status: STATUS_LABELS[key] || "Đang xử lý",
        };
      });
      setLookupResults(normalized);
    } catch (err) {
      console.error("Tra cứu theo email lỗi:", err);
      alert("Không tra cứu được đơn theo email này.");
    } finally {
      setLookupLoading(false);
    }
  };

  // Tra cứu theo mã/keyword và trạng thái
  const handleLookupByCode = async (e) => {
    e.preventDefault();
    try {
      setLookupLoading(true);
      const list = await getOrdersByKeyword(codeLookup, statusLookup);
      const normalized = list.map((o) => {
        const key = STATUS_LABELS[o.status]
          ? o.status
          : VI_TO_EN[o.status] || "pending";
        return {
          ...o,
          _statusKey: key,
          status: STATUS_LABELS[key] || "Đang xử lý",
        };
      });
      setLookupResults(normalized);
    } catch (err) {
      console.error("Tra cứu theo mã lỗi:", err);
      alert("Không tra cứu được đơn theo mã.");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-2xl font-bold mb-2">Lịch sử</h1>

      {/* Đơn hàng của người đang login */}
      {currentUser ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Đơn hàng của bạn: {currentUser.name}
          </h2>
          {!orders.length ? (
            <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => {
                const badgeClass =
                  STATUS_STYLES[o._statusKey] || "bg-slate-100 text-slate-600";
                return (
                  <li key={o.id} className="border p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-2 gap-4">
                      <span className="font-semibold">Mã đơn: {o.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="text-gray-700">
                      Tổng tiền:{" "}
                      <span className="font-semibold text-blue-600">
                        {Number(o.total || 0).toLocaleString("vi-VN")}₫
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Ngày đặt:{" "}
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </p>
                    <button
                      onClick={() => openDetail(o)}
                      className="mt-3 text-sm text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Bạn chưa đăng nhập - Vui lòng{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            đăng nhập
          </Link>{" "}
          để xem được đơn hàng.
        </p>
      )}

      {/* Modal chi tiết đơn */}
      {detailOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Đơn hàng #{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ngày tạo:{" "}
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                Đóng
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap gap-3 items-center">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    STATUS_STYLES[selectedOrder._statusKey] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedOrder.status}
                </span>
                <span className="text-xs text-slate-500">
                  Thanh toán:{" "}
                  <span className="font-medium text-slate-700">
                    {renderPayment(selectedOrder)}
                  </span>
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">
                  Thông tin giao hàng
                </h4>
                <p className="text-sm text-slate-800">
                  {selectedOrder.customerName || "Khách lẻ"}
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-sm text-slate-500">
                    Email: {selectedOrder.customerEmail}
                  </p>
                )}
                {selectedOrder.phone && (
                  <p className="text-sm text-slate-500">
                    SĐT: {selectedOrder.phone}
                  </p>
                )}
                {selectedOrder.address && (
                  <p className="text-sm text-slate-500">
                    Địa chỉ: {selectedOrder.address}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Sản phẩm
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Tên</th>
                        <th className="px-3 py-2 text-right w-20">SL</th>
                        <th className="px-3 py-2 text-right w-28">Giá</th>
                        <th className="px-3 py-2 text-right w-28">T.tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedOrder.items) &&
                      selectedOrder.items.length ? (
                        selectedOrder.items.map((it, idx) => {
                          const qty = Number(it.quantity || 0);
                          const price = Number(it.price || 0);
                          const sub = qty * price;
                          return (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2">
                                {it.title || it.name || `Sản phẩm #${idx + 1}`}
                              </td>
                              <td className="px-3 py-2 text-right">{qty}</td>
                              <td className="px-3 py-2 text-right">
                                {price.toLocaleString("vi-VN")}₫
                              </td>
                              <td className="px-3 py-2 text-right">
                                {sub.toLocaleString("vi-VN")}₫
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-4 text-center text-slate-400 text-sm"
                          >
                            Đơn này chưa có danh sách sản phẩm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <p className="text-sm">
                  Tổng tiền:{" "}
                  <span className="text-blue-600 font-semibold">
                    {Number(selectedOrder.total || 0).toLocaleString("vi-VN")}₫
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t bg-slate-50">
              <button
                onClick={closeDetail}
                className="px-4 py-2 text-sm border rounded-md text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
