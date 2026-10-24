import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useClickOutside, useCart } from "../hooks";

export default function Navbar({ onSearch, onCategorySelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { cartCount } = useCart();

  // Đóng dropdown khi click ra ngoài bằng custom hook useClickOutside
  const productDropdownRef = useClickOutside(() => setIsProductMenuOpen(false));
  const userDropdownRef = useClickOutside(() => setIsUserMenuOpen(false));
  const notifDropdownRef = useClickOutside(() => setIsNotifOpen(false));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    const section = document.getElementById("product-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectCategory = (catId) => {
    setIsProductMenuOpen(false);
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
    const section = document.getElementById("product-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getUserInitial = () => {
    if (!user) return "U";
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EAEAE8]">
      {/* Top micro bar */}
      

      {/* Main Bar */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        {/* 1. LOGO (AURA VAULT) */}
        <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
          <div className="w-9 h-9 bg-[#111111] text-white flex items-center justify-center font-serif text-sm font-bold tracking-widest transition-transform group-hover:scale-95">
            AV
          </div>
          <div>
            <span className="text-xl tracking-[0.25em] font-serif font-bold text-[#111111] uppercase block">
              Aura Vault
            </span>
            <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#888888] -mt-1 block">
              High-End Consignment
            </span>
          </div>
        </Link>

        {/* 2. MENU: Trang Chủ | Sản Phẩm ▼ | BST Mới | Ký Gửi */}
        <nav className="hidden xl:flex items-center space-x-8 text-xs font-mono uppercase tracking-[0.15em]">
          <Link
            to="/"
            className="text-[#111111] font-semibold border-b border-[#111111] pb-1"
          >
            Trang Chủ
          </Link>

          {/* Sản Phẩm Dropdown */}
          <div className="relative" ref={productDropdownRef}>
            <button
              onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
              className="flex items-center space-x-1.5 text-[#555555] hover:text-[#111111] transition-colors pb-1 cursor-pointer"
            >
              <span>Sản Phẩm</span>
              <span className={`text-[9px] transition-transform duration-200 ${isProductMenuOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {isProductMenuOpen && (
              <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-[#E5E5E3] shadow-[0_15px_35px_rgba(0,0,0,0.06)] py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => { setIsProductMenuOpen(false); navigate("/shop"); }}
                  className="w-full text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#333333] hover:bg-[#F8F8F7] hover:text-[#111111] flex justify-between items-center transition"
                >
                  <span>Tất Cả Sản Phẩm</span>
                  <span className="text-[10px] text-[#999999]">ALL</span>
                </button>
                <div className="border-t border-[#F0F0EE] my-1"></div>
                <button
                  onClick={() => { setIsProductMenuOpen(false); navigate("/shop?category_id=3"); }}
                  className="w-full text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#333333] hover:bg-[#F8F8F7] hover:text-[#111111] flex justify-between items-center transition"
                >
                  <span>Đồng Hồ Xa Xỉ</span>
                  <span className="text-[10px] text-[#999999]">Rolex / AP</span>
                </button>
                <button
                  onClick={() => { setIsProductMenuOpen(false); navigate("/shop?category_id=1"); }}
                  className="w-full text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#333333] hover:bg-[#F8F8F7] hover:text-[#111111] flex justify-between items-center transition"
                >
                  <span>Túi Xách Thượng Lưu</span>
                  <span className="text-[10px] text-[#999999]">Hermès / Chanel</span>
                </button>
                <button
                  onClick={() => { setIsProductMenuOpen(false); navigate("/shop?category_id=2"); }}
                  className="w-full text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#333333] hover:bg-[#F8F8F7] hover:text-[#111111] flex justify-between items-center transition"
                >
                  <span>Sneaker & Giày Hiệu</span>
                  <span className="text-[10px] text-[#999999]">Jordan / Dior</span>
                </button>
                <button
                  onClick={() => { setIsProductMenuOpen(false); navigate("/shop?category_id=5"); }}
                  className="w-full text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#333333] hover:bg-[#F8F8F7] hover:text-[#111111] flex justify-between items-center transition"
                >
                  <span>Trang Sức & Phụ Kiện</span>
                  <span className="text-[10px] text-[#999999]">Cartier / VCA</span>
                </button>
              </div>
            )}
          </div>

          <Link to="/shop" className="text-[#555555] hover:text-[#111111] transition-colors pb-1">
            BST Mới
          </Link>

          {user && user.role === 'admin' ? (
            <Link
              to="/admin"
              className="text-[#111111] font-semibold hover:text-black transition-colors pb-1 flex items-center gap-1"
            >
              <span>⚙️</span> Quản Trị Sàn
            </Link>
          ) : (
            <Link
              to="/my-products"
              className="text-[#555555] hover:text-[#111111] transition-colors pb-1"
            >
              Ký Gửi
            </Link>
          )}
        </nav>

        {/* 3. [ 🔍 TÌM KIẾM ] */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-grow max-w-xs xl:max-w-sm relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm Rolex, Chanel, Cartier..."
            className="w-full bg-[#FAFAFA] border border-[#DCDCDA] px-3.5 py-2 pl-9 text-xs font-sans text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] focus:bg-white transition-all"
          />
          <button type="submit" className="absolute left-3 top-2.5 text-xs text-[#888888] hover:text-[#111111]">
            🔍
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                if (onSearch) onSearch("");
              }}
              className="absolute right-3 top-2.5 text-xs text-[#888888] hover:text-[#111111]"
            >
              ✕
            </button>
          )}
        </form>

        {/* 4. ACTIONS: [ ❤️ Wishlist ] [ 🛍️ Giỏ hàng (2) ] [ 🔔 ] [ 👤 Avatar User ▼ ] */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-xs font-mono">
         

          {/* Giỏ hàng */}
          <button
            className="relative p-2 text-[#444444] hover:text-[#111111] transition-colors cursor-pointer flex items-center space-x-1"
            title="Giỏ hàng của bạn"
            onClick={() => navigate("/cart")}
          >
            <span className="text-base sm:text-lg">🛍️</span>
            {cartCount > 0 && (
              <span className="bg-[#111111] text-white text-[9px] font-mono px-1.5 py-0.5 leading-none">
                {cartCount}
              </span>
            )}
          </button>

          {/* Thông báo */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-[#444444] hover:text-[#111111] transition-colors cursor-pointer"
              title="Thông báo"
            >
              <span className="text-base sm:text-lg">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D93838]"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-[#E5E5E3] shadow-[0_15px_35px_rgba(0,0,0,0.06)] p-4 z-50 text-left">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#777777] border-b border-[#F0F0EE] pb-2 mb-2 font-semibold flex justify-between">
                  <span>Thông Báo Sàn</span>
                  <span className="text-[#111111]">{notificationCount} mới</span>
                </div>
                <div className="space-y-2.5 text-xs font-sans">
                  <div className="p-2 bg-[#FAFAFA] border border-[#F0F0EE]">
                    <p className="font-semibold text-[#111111] text-[11px]">Chuyên mục mới: Trang Sức Cao Cấp</p>
                    <p className="text-[10px] text-[#777777] mt-0.5">Khám phá các thiết kế Cartier, Van Cleef vừa lên sàn.</p>
                  </div>
                  <div className="p-2 bg-[#FAFAFA] border border-[#F0F0EE]">
                    <p className="font-semibold text-[#111111] text-[11px]">Bảo chứng kiểm định</p>
                    <p className="text-[10px] text-[#777777] mt-0.5">Miễn phí thẩm định cho 50 tin ký gửi đầu tiên trong tháng.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-[1px] bg-[#EAEAE8] hidden sm:block"></div>

          {/* User Block: [ 👤 Avatar User ▼ ] or Login/Register */}
          {token && user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2.5 p-1 border border-[#DCDCDA] hover:border-[#111111] transition cursor-pointer bg-[#FAFAFA]"
              >
                {/* Avatar Initial Badge */}
                <div className="w-7 h-7 bg-[#111111] text-white flex items-center justify-center font-mono font-bold text-xs uppercase">
                  {getUserInitial()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[11px] font-medium text-[#111111] max-w-[90px] truncate leading-tight">
                    {user.name || user.email}
                  </span>
                  <span className="text-[8px] font-mono tracking-wider uppercase text-[#888888]">
                    {user.role || "Member"}
                  </span>
                </div>
                <span className={`text-[8px] text-[#777777] transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-[#E5E5E3] shadow-[0_15px_35px_rgba(0,0,0,0.06)] py-2 z-50 text-left">
                  <div className="px-5 py-3 border-b border-[#F0F0EE]">
                    <p className="text-xs font-semibold text-[#111111] truncate">{user.name || "Khách Hàng"}</p>
                    <p className="text-[10px] text-[#888888] font-mono truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setIsUserMenuOpen(false); navigate("/profile"); }}
                      className="w-full text-left px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#444444] hover:bg-[#F8F8F7] hover:text-[#111111] transition"
                    >
                      Thông Tin Cá Nhân
                    </button>

                    {/* Chỉ hiển thị cho khách hàng & người bán, Ẩn đối với Admin */}
                    {(!user || user.role !== 'admin') && (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); navigate("/my-orders"); }}
                          className="w-full text-left px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#444444] hover:bg-[#F8F8F7] hover:text-[#111111] transition"
                        >
                          Đơn Hàng Của Tôi
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); navigate("/my-products"); }}
                          className="w-full text-left px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#444444] hover:bg-[#F8F8F7] hover:text-[#111111] transition"
                        >
                          Ký Gửi Của Tôi
                        </button>
                      </>
                    )}

                    {/* Menu quản trị riêng biệt cho Admin */}
                    {user && user.role === 'admin' && (
                      <button
                        onClick={() => { setIsUserMenuOpen(false); navigate("/admin"); }}
                        className="w-full text-left px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#111111] font-semibold bg-[#F8F8F7] hover:bg-[#EFEFEF] transition flex items-center justify-between"
                      >
                        <span>⚙️ Admin Dashboard</span>
                        <span className="text-[9px] bg-[#111111] text-white px-1.5 py-0.5">ADMIN</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#F0F0EE] pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#D93838] hover:bg-[#FDF2F2] transition"
                    >
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-2 border border-[#DCDCDA] hover:border-[#111111] text-[11px] font-mono uppercase tracking-wider transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 bg-[#111111] text-white hover:bg-[#2A2A2A] text-[11px] font-mono uppercase tracking-wider transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

