import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import BannerSlider from "../components/BannerSlider";
import Footer from "../components/Footer";
import { useListings } from "../hooks";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const { products, loading, refetch } = useListings({ status: "active", limit: 4 });

  // Refetch products whenever category filter or search keyword changes
  useEffect(() => {
    const params = { limit: 4 };
    if (activeCategory !== "all") params.category_id = activeCategory;
    if (searchKeyword.trim()) params.title = searchKeyword.trim();
    refetch(params);
  }, [activeCategory, searchKeyword, refetch]);

  // Smooth scroll to catalog section
  const scrollToProducts = () => {
    const section = document.getElementById("product-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between selection:bg-[#111111] selection:text-white text-[#111111]">
      {/* 1. Global Navigation Bar */}
      <Navbar
        onSearch={(kw) => setSearchKeyword(kw)}
        onCategorySelect={(catId) => setActiveCategory(catId)}
        cartCount={2}
        wishlistCount={1}
      />

      {/* 2. Reusable Hero Banner Slider */}
      <BannerSlider
        onSlideAction={(slide) => {
          if (slide.categoryFilter) {
            navigate(`/shop?category_id=${slide.categoryFilter}`);
          } else {
            scrollToProducts();
          }
        }}
        onSecondaryAction={scrollToProducts}
      />

      {/* 3. Curated Featured Products */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex-grow w-full space-y-16">
        {/* ── 1. 5 Danh Mục Tinh Hoa (Curated Collections) ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#EAEAE8]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#999999] block mb-1">
                Curated Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#111111] tracking-wide font-normal">
                Khám Phá Theo Danh Mục
              </h2>
            </div>
            <p className="text-xs text-[#777777] font-mono mt-2 sm:mt-0">
              5 PHÂN HẠNG BẢO CHỨNG ĐỘC BẢN
            </p>
          </div>

          {/* 5-Column Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                num: '01',
                title: 'Đồng Hồ Xa Xỉ',
                subtitle: 'Haute Horlogerie',
                catId: 3,
                image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
              },
              {
                num: '02',
                title: 'Túi Xách Thượng Lưu',
                subtitle: 'Iconic Handbags',
                catId: 1,
                image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
              },
              {
                num: '03',
                title: 'Sneaker & Giày Hiệu',
                subtitle: 'Rare & Limited',
                catId: 2,
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
              },
              {
                num: '04',
                title: 'Thời Trang Đường Phố',
                subtitle: 'Luxury Streetwear',
                catId: 4,
                image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
              },
              {
                num: '05',
                title: 'Trang Sức & Phụ Kiện',
                subtitle: 'High Jewelry & Gems',
                catId: 5,
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
              },
            ].map((col) => (
              <div
                key={col.num}
                onClick={() => navigate(`/shop?category_id=${col.catId}`)}
                className="group relative h-[380px] sm:h-[420px] overflow-hidden cursor-pointer bg-[#141414] transition-all duration-500 ease-out"
              >
                {/* Background Image with gentle zoom on hover */}
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
                />

                {/* Soft Vignette / Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 transition-colors duration-500" />

                {/* Top Subtle Label */}
                <div className="absolute top-5 left-5 right-5 flex justify-between items-center text-white/70">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase">
                    {col.num}
                  </span>
                  <span className="text-[9px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Aura Vault
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-6 left-5 right-5 text-white">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 mb-1.5">
                    {col.subtitle}
                  </p>
                  <h3 className="text-lg sm:text-xl font-serif tracking-wide text-white mb-3 group-hover:translate-x-0.5 transition-transform duration-300">
                    {col.title}
                  </h3>
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                      Khám phá
                    </span>
                    <span className="text-sm font-mono text-white/80 group-hover:translate-x-1.5 group-hover:text-white transition-all duration-300">
                      →
                    </span>
                  </div>
                </div>

                {/* Minimalist Border Hover Effect */}
                <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. Sản Phẩm Nổi Bật & Mới Lên Sàn ── */}
        <section id="product-section" className="pt-4">
          <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-[#EAEAE8] pb-4 mb-8">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#888888] mb-1">
                Recent Acquisitions
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#111111] tracking-wide font-normal">
                Sản Phẩm Mới Nhất
              </h2>
            </div>
            <p className="text-xs text-[#777777] font-mono mt-2 md:mt-0">
              100% ĐÃ QUA THẨM ĐỊNH BẢO CHỨNG BỞI CHUYÊN GIA
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-[#F5F5F3] border border-[#E5E5E3] h-[380px] animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#DCDCDA] bg-[#FAFAFA] p-8">
              <span className="text-3xl block mb-2">🏷️</span>
              <h3 className="text-base font-serif text-[#111111]">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-[#777777] mt-1 mb-4">Hãy thử tìm với từ khóa khác hoặc đặt lại bộ lọc.</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchKeyword("");
                }}
                className="px-5 py-2.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-wider"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onSelect={(id) => navigate(`/product/${id}`)}
                    onDetail={() => navigate(`/product/${item.id}`)}
                  />
                ))}
              </div>

              {/* Link to Shop */}
              <div className="text-center pt-2">
                <button
                  onClick={() => navigate("/shop")}
                  className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
                >
                  <span>Xem Tất Cả Sản Phẩm</span>
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 4. Global Footer */}
      <Footer onCategorySelect={(catId) => {
        setActiveCategory(catId);
        scrollToProducts();
      }} />
    </div>
  );
}
