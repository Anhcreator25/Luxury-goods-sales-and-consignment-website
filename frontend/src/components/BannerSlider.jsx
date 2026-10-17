import React, { useState, useEffect } from "react";

// Dữ liệu banner mặc định cho nền tảng Aura Vault
export const DEFAULT_BANNER_SLIDES = [
  {
    id: 1,
    tag: "Haute Horlogerie 2026",
    title: "Đồng Hồ Xa Xỉ Thụy Sĩ",
    subtitle: "Tuyển tập những cỗ máy thời gian huyền thoại từ Rolex, Patek Philippe, Audemars Piguet đã qua thẩm định 100%.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85",
    linkText: "Khám phá Đồng Hồ",
    secondaryText: "Xem tất cả",
    categoryFilter: 3
  },
  {
    id: 2,
    tag: "Iconic Handbags",
    title: "Kiệt Tác Túi Xách Cao Cấp",
    subtitle: "Sở hữu những thiết kế kinh điển từ Hermès Birkin, Chanel Flap Bag và Dior Lady với chứng thư xác thực độc bản.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=85",
    linkText: "Khám phá Túi Xách",
    secondaryText: "Xem tất cả",
    categoryFilter: 2
  },
  {
    id: 3,
    tag: "High Jewelry & Gems",
    title: "Trang Sức & Phụ Kiện Tinh Hoa",
    subtitle: "Vẻ đẹp vượt thời gian của vàng khối, kim cương và đá quý tự nhiên từ Cartier, Van Cleef & Arpels, Bvlgari.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85",
    linkText: "Khám phá Trang Sức",
    secondaryText: "Xem tất cả",
    categoryFilter: 4
  }
];

export default function BannerSlider({
  slides = DEFAULT_BANNER_SLIDES,
  autoPlayInterval = 6000,
  heightClass = "h-[520px] sm:h-[600px]",
  onSlideAction,
  onSecondaryAction
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlayInterval || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlayInterval, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className={`relative w-full ${heightClass} bg-[#111111] overflow-hidden`}>
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

            <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center text-white z-20">
              <div className="max-w-2xl space-y-5">
                {slide.tag && (
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-[0.3em] text-[#E0E0DE]">
                    {slide.tag}
                  </span>
                )}

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-tight">
                  {slide.title}
                </h2>

                {slide.subtitle && (
                  <p className="text-xs sm:text-sm text-[#CCCCCC] font-light leading-relaxed max-w-xl font-sans">
                    {slide.subtitle}
                  </p>
                )}

                <div className="pt-2 flex items-center space-x-4">
                  {slide.linkText && (
                    <button
                      onClick={() => onSlideAction && onSlideAction(slide)}
                      className="px-8 py-3.5 bg-white text-[#111111] hover:bg-[#EAEAE8] text-xs font-mono font-medium uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg"
                    >
                      {slide.linkText} →
                    </button>
                  )}
                  {slide.secondaryText && (
                    <button
                      onClick={() => onSecondaryAction && onSecondaryAction(slide)}
                      className="px-6 py-3.5 border border-white/40 hover:border-white text-white text-xs font-mono uppercase tracking-[0.2em] transition-all cursor-pointer"
                    >
                      {slide.secondaryText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Carousel Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-8 z-30 flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

