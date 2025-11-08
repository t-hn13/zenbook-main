// src/components/admin/FooterAdmin.jsx
const FooterAdmin = () => {
  return (
    <footer className="h-12 flex items-center justify-between px-4 md:px-6 text-xs text-slate-400 bg-white border-t">
      <span>© {new Date().getFullYear()} ZenBooks Admin</span>
      <span className="hidden sm:block">Made with React + Vite</span>
    </footer>
  );
};
export default FooterAdmin;
