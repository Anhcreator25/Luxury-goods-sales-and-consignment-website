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
  const { products, loading, refetch } = useListings({ status: "active", limit: 8 });

  // Refetch products whenever category filter or search keyword changes
  useEffect(() => {
    const params = { limit: 8 };
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
          setActiveCategory(slide.categoryFilter);
          scrollToProducts();
        }}
        onSecondaryAction={scrollToProducts}
      />

      {/* 3. Curated Featured Products */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex-grow w-full space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-[#EAEAE8] pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#888888] mb-1">
              Curated Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#111111] tracking-wide font-normal">
              Sản Phẩm Nổi Bật & Mới Lên Sàn
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelect={(id) => navigate(`/product/${id}`)}
                onDetail={() => navigate(`/product/${item.id}`)}
              />
            ))}
          </div>
        )}

        {/* 3. Collection Pillars */}
        <section className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E5E3] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] block">Collection 01</span>
              <h3 className="text-xl font-serif text-[#111111]">Đồng Hồ Thụy Sĩ</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Tập hợp các thương hiệu đồng hồ cơ khí đỉnh cao Rolex, Patek Philippe, Audemars Piguet nguyên bản.
              </p>
              <button
                onClick={() => {
                  setActiveCategory(3);
                  scrollToProducts();
                }}
                className="text-xs font-mono uppercase tracking-widest text-[#111111] hover:underline underline-offset-4"
              >
                Khám phá ngay →
              </button>
            </div>

            <div className="bg-white border border-[#E5E5E3] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] block">Collection 02</span>
              <h3 className="text-xl font-serif text-[#111111]">Túi Xách Thượng Lưu</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Các mẫu túi xách kinh điển với độ hiếm cao và giá trị đầu tư bền vững theo thời gian.
              </p>
              <button
                onClick={() => {
                  setActiveCategory(2);
                  scrollToProducts();
                }}
                className="text-xs font-mono uppercase tracking-widest text-[#111111] hover:underline underline-offset-4"
              >
                Khám phá ngay →
              </button>
            </div>

            <div className="bg-white border border-[#E5E5E3] p-8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] block">Collection 03</span>
              <h3 className="text-xl font-serif text-[#111111]">Trang Sức Độc Bản</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Trang sức vàng khối, kim cương đạt tiêu chuẩn kiểm định nghiêm ngặt từ phòng thí nghiệm uy tín.
              </p>
              <button
                onClick={() => {
                  setActiveCategory(4);
                  scrollToProducts();
                }}
                className="text-xs font-mono uppercase tracking-widest text-[#111111] hover:underline underline-offset-4"
              >
                Khám phá ngay →
              </button>
            </div>
          </div>
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
