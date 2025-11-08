// src/components/SessionWatcher.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";

export default function SessionWatcher() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((s) => s.auth);
  useEffect(() => {
    const raw = localStorage.getItem("force-logout");
    if (raw && currentUser) {
      try {
        const data = JSON.parse(raw);
        if (String(data.userId) === String(currentUser.id)) {
          dispatch(logoutUser());
        }
      } catch {}
    }
    const handleStorage = (e) => {
      if (e.key !== "force-logout") return;
      if (!currentUser) return;
      try {
        const data = JSON.parse(e.newValue);
        if (data && String(data.userId) === String(currentUser.id)) {
          dispatch(logoutUser());
        }
      } catch (err) {
        console.error("Lỗi parse force-logout:", err);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [currentUser, dispatch]);

  return null;
}
