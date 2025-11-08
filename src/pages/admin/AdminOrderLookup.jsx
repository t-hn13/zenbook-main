// src/pages/admin/AdminOrderLookup.jsx
import { useEffect, useMemo, useState } from "react";
import { getOrders, getOrdersByKeyword } from "../../services/orderApi";
import { Loader2, Search, X } from "lucide-react";

const STATUS_MAP = {
  all: { label: "Tất cả", className: "bg-slate-100 text-slate-700" },
  pending: { label: "Đang xử lý", className: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang giao", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  canceled: { label: "Đã huỷ", className: "bg-red-100 text-red-600" },
};

const normalizeStatus = (raw) => {
  const VI_TO_EN = {
    "Đang xử lý": "pending",
    "Đang giao": "processing",
    "Hoàn thành": "completed",
    "Đã huỷ": "canceled",
    "Đã hủy": "canceled",
  };
  if (!raw) return "pending";
  if (STATUS_MAP[raw]) return raw;
  if (VI_TO_EN[raw]) return VI_TO_EN[raw];
  return "pending";
};

const AdminOrderLookup = () => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setResults(data.slice(0, 15));
      } catch (e) {
        console.error("Load recent orders error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await getOrdersByKeyword(
          keyword,
          status === "all" ? "" : status
        );
        if (!ignore) setResults(res);
      } catch (e) {
        console.error("Search orders error:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [keyword, status]);

  const formatMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

  const counts = useMemo(() => {
    const c = {
      all: results.length,
      pending: 0,
      processing: 0,
      completed: 0,
      canceled: 0,
    };
    results.forEach((o) => {
      const st = normalizeStatus(o.status);
      if (c[st] != null) c[st] += 1;
    });
    return c;
  }, [results]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Tra cứu đơn hàng</h2>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative md:flex-1">
            <div className="flex items-center gap-2 border rounded-md px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Gõ mã đơn (ví dụ: 1762..., 1, 2, ...)"
                className="w-full outline-none text-sm"
              />
              {keyword && (
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setKeyword("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gợi ý theo thời gian thực: nhập “1” sẽ hiện tất cả đơn có mã chứa
              “1”.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Trạng thái:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md px-2 py-2 text-sm bg-white cursor-pointer"
            >
              {Object.keys(STATUS_MAP).map((k) => (
                <option key={k} value={k}>
                  {STATUS_MAP[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 ">
          {Object.keys(STATUS_MAP).map((k) => (
            <span
              key={k}
              className={`px-2 py-1 rounded text-xs ${STATUS_MAP[k].className}`}
            >
              {STATUS_MAP[k].label}: <b>{counts[k] ?? 0}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Đang tìm...
                </span>
              ) : (
                <>
                  Kết quả: <b>{results.length}</b> đơn
                </>
              )}
            </p>
          </div>

          <div className="divide-y">
            {results.length === 0 && !loading ? (
              <p className="text-center text-slate-400 text-sm py-8">
                Không tìm thấy đơn nào phù hợp.
              </p>
            ) : (
              results.map((o) => {
                const st = normalizeStatus(o.status);
                const stInfo = STATUS_MAP[st] || STATUS_MAP.pending;
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-slate-800 text-sm">
                          #{o.id}
                        </p>
                        <p className="text-xs text-slate-500">
                          {o.customerName || o.customerEmail || "Khách lẻ"} ·{" "}
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${stInfo.className}`}
                      >
                        {stInfo.label}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Tổng:{" "}
                      <b className="text-blue-600">{formatMoney(o.total)}</b> •
                      SP: {Array.isArray(o.items) ? o.items.length : 0}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 min-h-80">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Chọn một đơn ở danh sách để xem chi tiết.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Đơn hàng #{selected.id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ngày tạo:{" "}
                    {selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </p>
                </div>
                {(() => {
                  const st = normalizeStatus(selected.status);
                  const stInfo = STATUS_MAP[st] || STATUS_MAP.pending;
                  return (
                    <span
                      className={`px-2 py-1 rounded text-xs h-max ${stInfo.className}`}
                    >
                      {stInfo.label}
                    </span>
                  );
                })()}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-slate-500">Khách:</span>{" "}
                    <b className="text-slate-800">
                      {selected.customerName || "Khách lẻ"}
                    </b>
                  </p>
                  {selected.customerEmail && (
                    <p className="text-sm">
                      <span className="text-slate-500">Email:</span>{" "}
                      {selected.customerEmail}
                    </p>
                  )}
                  {selected.phone && (
                    <p className="text-sm">
                      <span className="text-slate-500">SĐT:</span>{" "}
                      {selected.phone}
                    </p>
                  )}
                  {selected.address && (
                    <p className="text-sm">
                      <span className="text-slate-500">Địa chỉ:</span>{" "}
                      {selected.address}
                    </p>
                  )}
                  {selected.paymentMethod && (
                    <p className="text-sm">
                      <span className="text-slate-500">Thanh toán:</span>{" "}
                      {selected.paymentMethodLabel || selected.paymentMethod}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-slate-500">Mã KH:</span>{" "}
                    {selected.customerId || "—"}
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Phương thức:</span>{" "}
                    {selected.paymentMethodLabel || "—"}
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Tổng tiền:</span>{" "}
                    <b className="text-blue-600">
                      {formatMoney(selected.total)}
                    </b>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Sản phẩm
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Tên</th>
                        <th className="px-3 py-2 text-right w-20">SL</th>
                        <th className="px-3 py-2 text-right w-28">Đơn giá</th>
                        <th className="px-3 py-2 text-right w-28">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selected.items) &&
                      selected.items.length ? (
                        selected.items.map((it, idx) => {
                          const qty = Number(it.quantity || 0);
                          const price = Number(it.price || 0);
                          const sub = qty * price;
                          return (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2">
                                {it.title || `#${it.id}`}
                              </td>
                              <td className="px-3 py-2 text-right">{qty}</td>
                              <td className="px-3 py-2 text-right">
                                {formatMoney(price)}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {formatMoney(sub)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-4 text-center text-slate-400"
                          >
                            Không có sản phẩm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-3">
                  <p className="text-sm">
                    Tổng:{" "}
                    <span className="text-blue-600 font-semibold">
                      {formatMoney(selected.total)}
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderLookup;
