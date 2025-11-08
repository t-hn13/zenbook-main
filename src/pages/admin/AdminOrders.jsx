import { useEffect, useState } from "react";
import { getOrders, updateOrder } from "../../services/orderApi";
import { Loader2, X } from "lucide-react";

const STATUS_MAP = {
  pending: { label: "Đang xử lý", className: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang giao", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  canceled: { label: "Đã huỷ", className: "bg-red-100 text-red-600" },
};

const STATUS_ORDER = ["pending", "processing", "completed", "canceled"];

const VI_TO_EN = {
  "Đang xử lý": "pending",
  "Đang giao": "processing",
  "Hoàn thành": "completed",
  "Đã huỷ": "canceled",
  "Đã hủy": "canceled",
};

const normalizeStatus = (raw) => {
  if (!raw) return "pending";
  if (STATUS_MAP[raw]) return raw;
  if (VI_TO_EN[raw]) return VI_TO_EN[raw];
  return "pending";
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [changingId, setChangingId] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailChanging, setDetailChanging] = useState(false);

  const [page, setPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [currentOrders, setCurrentOrders] = useState([]); // Các đơn hàng hiển thị hiện tại

  const PAGE_LIMIT = 10; // Hiển thị 10 đơn hàng mỗi trang

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      const normalized = (data || []).map((o) => ({
        ...o,
        status: normalizeStatus(o.status),
      }));

      setOrders(normalized);

      // Tính số trang
      const total = Math.ceil(normalized.length / PAGE_LIMIT);
      setTotalPages(total);

      // Cắt danh sách các đơn hàng để chỉ hiển thị 10 đơn hàng mỗi trang
      const start = (page - 1) * PAGE_LIMIT;
      const current = normalized.slice(start, start + PAGE_LIMIT);
      setCurrentOrders(current);
    } catch (err) {
      console.error("Không tải được đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const formatMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

  const handleView = (order) => {
    setSelectedOrder({
      ...order,
      status: normalizeStatus(order.status),
    });
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
    setDetailChanging(false);
  };

  const handleChangeStatusTable = async (order, newStatus) => {
    const normNew = normalizeStatus(newStatus);
    const normOld = normalizeStatus(order.status);

    if (!order || !order.id) return;
    if (normOld === normNew) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: normNew } : o))
    );
    setSelectedOrder((prev) =>
      prev && prev.id === order.id ? { ...prev, status: normNew } : prev
    );

    try {
      setChangingId(order.id);
      const updated = await updateOrder(String(order.id), { status: normNew });

      const fixed = {
        ...updated,
        status: normalizeStatus(updated.status),
      };

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, ...fixed } : o))
      );
      setSelectedOrder((prev) =>
        prev && prev.id === order.id ? { ...prev, ...fixed } : prev
      );

      await fetchData();
    } catch (err) {
      console.error(
        "[AdminOrders] Đổi trạng thái ở bảng lỗi:",
        err?.message,
        err?.response?.status,
        err?.response?.data
      );
      alert("Đổi trạng thái thất bại. Mở console để xem lỗi chi tiết.");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: normOld } : o))
      );
      setSelectedOrder((prev) =>
        prev && prev.id === order.id ? { ...prev, status: normOld } : prev
      );
    } finally {
      setChangingId(null);
    }
  };

  const handleChangeStatusModal = async (newStatus) => {
    const normNew = normalizeStatus(newStatus);
    const normOld = normalizeStatus(selectedOrder?.status);

    if (!selectedOrder || !selectedOrder.id) return;
    if (normNew === normOld) return;

    setSelectedOrder((prev) => ({ ...prev, status: normNew }));
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: normNew } : o
      )
    );

    try {
      setDetailChanging(true);
      const updated = await updateOrder(String(selectedOrder.id), {
        status: normNew,
      });

      const fixed = {
        ...updated,
        status: normalizeStatus(updated.status),
      };

      setSelectedOrder((prev) => ({ ...prev, ...fixed }));
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...fixed } : o))
      );

      await fetchData();
    } catch (err) {
      console.error(
        "[AdminOrders] Đổi trạng thái trong modal lỗi:",
        err?.message,
        err?.response?.status,
        err?.response?.data
      );
      alert("Đổi trạng thái thất bại. Mở console để xem lỗi chi tiết.");

      setSelectedOrder((prev) => ({ ...prev, status: normOld }));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: normOld } : o
        )
      );
    } finally {
      setDetailChanging(false);
    }
  };

  // Handle pagination: chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Quản lý đơn hàng</h2>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left w-36">Mã đơn</th>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left w-32">Tổng tiền</th>
              <th className="px-3 py-2 text-left w-44">Trạng thái</th>
              <th className="px-3 py-2 text-left w-40">Ngày tạo</th>
              <th className="px-3 py-2 text-left w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Đang tải đơn hàng...
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              currentOrders.map((o) => {
                const normStatus = normalizeStatus(o.status);
                const statusInfo =
                  STATUS_MAP[normStatus] || STATUS_MAP["pending"];

                return (
                  <tr key={o.id} className="border-t hover:bg-slate-50/70">
                    <td className="px-3 py-2 font-mono text-slate-700">
                      {o.id}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-slate-800">
                        {o.customerName || o.customer || "Khách lẻ"}
                      </p>
                      {o.phone ? (
                        <p className="text-xs text-slate-400">{o.phone}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-blue-600 font-semibold">
                      {formatMoney(o.total)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                        <select
                          value={normStatus}
                          onChange={(e) =>
                            handleChangeStatusTable(o, e.target.value)
                          }
                          disabled={changingId === o.id}
                          className="text-xs border rounded px-1 py-0.5 cursor-pointer"
                        >
                          {STATUS_ORDER.map((st) => (
                            <option key={st} value={st}>
                              {STATUS_MAP[st].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        onClick={() => handleView(o)}
                        className="text-blue-600 text-xs hover:underline cursor-pointer"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <>
          <div className="flex justify-center mt-4 flex-wrap gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-400 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1.5 rounded-md border text-sm ${
                  page === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-blue-600 border-blue-400 hover:bg-blue-50 cursor-pointer"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                page === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-400 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              Sau →
            </button>
          </div>
          <p className="text-center text-slate-500 text-sm">
            Trang <span className="font-semibold text-blue-600">{page}</span> /{" "}
            {totalPages}
          </p>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
