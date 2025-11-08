// src/pages/user/CheckOutSuccess.jsx
import { useLocation, Link } from "react-router-dom";

export default function CheckoutSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Đặt hàng thành công!
      </h1>
      <p className="text-gray-600 mb-8">
        Cảm ơn bạn đã mua sắm tại{" "}
        <span className="font-semibold">ZenBooks</span>.
      </p>

      {order && (
        <div className="bg-white shadow rounded-lg p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-800 mb-2">
            Mã đơn hàng: {order.id}
          </h2>
          <p className="text-sm text-gray-600 mb-1">
            Tổng tiền:{" "}
            <span className="font-medium text-blue-600">
              {order.total.toLocaleString()}₫
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-1">
            Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
          <p className="text-sm text-gray-600">
            Trạng thái:{" "}
            <span className="text-yellow-600 font-medium">{order.status}</span>
          </p>
        </div>
      )}

      {/* <Link
        to="/orders"
        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Xem đơn hàng
      </Link> */}
    </div>
  );
}
