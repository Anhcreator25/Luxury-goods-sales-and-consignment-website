import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between selection:bg-[#111111] selection:text-white text-[#111111]">
      {/* Top Navbar */}
      <header className="w-full px-8 py-6 border-b border-[#EAEAE8] bg-white flex justify-between items-center">
        <Link to="/" className="text-xl tracking-[0.25em] font-serif font-bold text-[#111111] uppercase">
          Aura Vault
        </Link>

        <div className="flex items-center space-x-6 text-xs uppercase font-mono tracking-wider">
          {token && user ? (
            <div className="flex items-center space-x-4">
              <span className="text-[#666666]">
                Xin chào, <strong className="text-[#111111] font-medium">{user.name || user.email}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[#DCDCDA] hover:border-[#111111] transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="space-x-3">
              <Link
                to="/login"
                className="px-5 py-2.5 border border-[#DCDCDA] hover:border-[#111111] transition-colors inline-block"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-[#111111] text-white hover:bg-[#2A2A2A] transition-colors inline-block"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="inline-block px-3 py-1 text-[11px] font-mono tracking-[0.25em] uppercase text-[#666666] bg-white border border-[#E5E5E3]">
            High-End Consignment & Authenticated Trading
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#111111] tracking-tight leading-tight">
            Khẳng định phong cách với <br />
            <span className="italic font-light">bộ sưu tập xa xỉ độc bản.</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm text-[#666666] leading-relaxed font-sans">
            Aura Vault là sàn giao dịch và thẩm định hàng hiệu cao cấp dành cho Sneaker giới hạn, 
            Túi xách cao cấp và Đồng hồ xa xỉ với quy trình xác thực độc quyền.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-[#111111] text-white text-xs font-mono font-medium uppercase tracking-[0.2em] hover:bg-[#2A2A2A] transition-all"
            >
              Khám phá bộ sưu tập
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white border border-[#DCDCDA] text-[#111111] text-xs font-mono font-medium uppercase tracking-[0.2em] hover:border-[#111111] transition-all"
            >
              Ký gửi sản phẩm
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full px-8 py-6 border-t border-[#EAEAE8] flex flex-wrap justify-between items-center text-[11px] text-[#888888] font-mono">
        <div>AURA VAULT PLATFORM © {new Date().getFullYear()}</div>
        <div className="space-x-6">
          <span>AUTHENTICITY GUARANTEED</span>
          <span>ESCROW SECURED</span>
        </div>
      </footer>
    </div>
  );
}

