// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import LayoutUser from "./layouts/user/LayoutUser.jsx";
import Home from "./pages/user/Home.jsx";
import Products from "./pages/user/Products.jsx";
import ProductDetail from "./pages/user/ProductDetail.jsx";
import Cart from "./pages/user/Cart.jsx";
import CheckOut from "./pages/user/CheckOut.jsx";
import Login from "./pages/user/Login.jsx";
import Register from "./pages/user/Register.jsx";
import Contact from "./pages/user/Contact.jsx";
import About from "./pages/user/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import CheckoutSuccess from "./pages/user/CheckoutSuccess.jsx";
import Orders from "./pages/user/Orders.jsx";
import LayoutAdmin from "./layouts/admin/LayoutAdmin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminOrderLookup from "./pages/admin/AdminOrderLookup.jsx";
import { getCart } from "./services/cartApi";
import { setCart } from "./features/cart/cartSlice";
import SessionWatcher from "./components/SessionWatcher";
import AdminBrands from "./pages/admin/AdminBrands.jsx";
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      try {
        const data = await getCart();
        dispatch(setCart(data));
      } catch (e) {
        console.error("Không load được giỏ hàng:", e);
      }
    })();
  }, [dispatch]);
  return (
    <>
      <SessionWatcher />
      <Routes>
        <Route element={<LayoutUser />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<CheckOut />} />
          <Route path="checkout-success" element={<CheckoutSuccess />} />
          <Route path="orders" element={<Orders />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="order-lookup" element={<AdminOrderLookup />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
