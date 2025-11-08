// src/layouts/user/HeaderUser.jsx
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";
import axios from "axios";
const HeaderUser = () => {
  const { currentUser } = useSelector((s) => s.auth);
  const cartItems = useSelector((s) => s.cart.items);
  const totalQty = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const userRef = useRef(null);
  const suggestRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsSearchOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setIsUserOpen(false);
      if (suggestRef.current && !suggestRef.current.contains(e.target))
        setShowSuggest(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  const navLinkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg transition ${
      isActive
        ? "bg-blue-500 text-white"
        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
    }`;
  const handleUserClick = () => {
    if (!currentUser) navigate("/login");
    else setIsUserOpen((prev) => !prev);
  };
  const handleLogout = () => {
    dispatch(logoutUser());
    setIsUserOpen(false);
    navigate("/");
  };
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get("http://localhost:3000/products");
        const filtered = res.data.filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 6));
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    };
    const t = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(t);
  }, [query]);
  const handleSelect = (id) => {
    setQuery("");
    setShowSuggest(false);
    setIsSearchOpen(false);
    navigate(`/product/${id}`);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${query}`);
      setShowSuggest(false);
      setIsSearchOpen(false);
    }
  };
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-3xl font-extrabold bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text tracking-tight"
        >
          ZenBooks
        </Link>
        <nav className="hidden md:flex gap-4 items-center">
          <NavLink to="/" end className={navLinkCls}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={navLinkCls}>
            Sản phẩm
          </NavLink>
          <NavLink to="/about" className={navLinkCls}>
            Giới thiệu
          </NavLink>
          <NavLink to="/contact" className={navLinkCls}>
            Liên hệ
          </NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSearchOpen((p) => !p)}
            className={`cursor-pointer ${
              isSearchOpen ? "text-red-500 rotate-90" : "text-blue-500"
            } transition`}
          >
            <Search size={22} />
          </button>
          <div ref={userRef} className="relative">
            <button
              onClick={handleUserClick}
              className="text-blue-500 hover:text-blue-700 transition cursor-pointer"
            >
              <User size={22} />
            </button>
            <AnimatePresence>
              {currentUser && isUserOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 bg-blue-50 rounded-lg shadow-lg text-sm w-44 z-50"
                >
                  <div className="px-4 py-2 border-b text-gray-600">
                    Xin chào,{" "}
                    <span className="font-semibold">{currentUser.name}</span>
                  </div>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setIsUserOpen(false)}
                  >
                    Xem đơn hàng
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink to="/cart" className="relative">
            <ShoppingCart
              className="text-blue-500 hover:text-blue-700"
              size={22}
            />
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {totalQty}
              </span>
            )}
          </NavLink>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            <Menu size={26} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white shadow-md relative"
          >
            <div
              className="max-w-7xl mx-auto px-4 py-3 relative"
              ref={suggestRef}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 relative"
              >
                <Search
                  size={20}
                  className="text-gray-500 ml-3 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Nhập tên sách cần tìm..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggest(true);
                  }}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setShowSuggest(false);
                    setQuery("");
                  }}
                  className="text-blue-500 hover:text-red-500 mr-2 cursor-pointer"
                >
                  <X size={20} />
                </button>
                <AnimatePresence>
                  {showSuggest && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-10 top-[105%] w-[88%] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                      style={{ maxHeight: 280, overflowY: "auto" }}
                    >
                      {suggestions.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => handleSelect(item.id)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer shadow-2xs last:shadow-2xs"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-9 h-12 object-cover rounded-md border"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.author}
                            </p>
                          </div>
                          <span className="text-blue-600 font-semibold text-sm whitespace-nowrap">
                            {item.price?.toLocaleString()}₫
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
                {showSuggest && query.trim() && suggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute left-10 top-[105%] w-[88%] bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-gray-500 text-sm text-center"
                  >
                    Không tìm thấy sản phẩm phù hợp.
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-9999 bg-white"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            ref={menuRef}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-3xl font-extrabold bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text"
              >
                ZenBooks
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={28} />
              </button>
            </div>

            <nav className="px-4 py-3">
              <ul className="space-y-2">
                {[
                  { path: "/", label: "Trang chủ" },
                  { path: "/products", label: "Sản phẩm" },
                  { path: "/contact", label: "Liên hệ" },
                  { path: "/about", label: "Giới thiệu" },
                ].map(({ path, label }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end={path === "/"}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full px-4 py-3 rounded-lg text-base font-medium ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto px-5 py-4 border-t text-center text-sm text-gray-500">
              © {new Date().getFullYear()} ZenBooks
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default HeaderUser;
