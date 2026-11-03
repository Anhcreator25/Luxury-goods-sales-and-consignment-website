import React, { useState, useEffect } from "react";

// Dữ liệu 5 banner danh mục chuẩn cho nền tảng Aura Vault
export const DEFAULT_BANNER_SLIDES = [
  {
    id: 1,
    tag: "Haute Horlogerie 2026",
    title: "Đồng Hồ Xa Xỉ Thụy Sĩ",
    subtitle: "Tuyển tập những cỗ máy thời gian huyền thoại từ Rolex, Patek Philippe, Audemars Piguet đã qua thẩm định 100%.",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1920&q=85",
    linkText: "Khám phá Đồng Hồ",
    secondaryText: "Xem tất cả",
    categoryFilter: 3
  },
  {
    id: 2,
    tag: "Iconic Handbags",
    title: "Kiệt Tác Túi Xách Thượng Lưu",
    subtitle: "Sở hữu những thiết kế kinh điển từ Hermès Birkin, Chanel Flap Bag và Dior Lady với chứng thư xác thực độc bản.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1920&q=85",
    linkText: "Khám phá Túi Xách",
    secondaryText: "Xem tất cả",
    categoryFilter: 1
  },
  {
    id: 3,
    tag: "Rare & Limited Edition",
    title: "Sneaker & Giày Hiệu Độc Bản",
    subtitle: "Bộ sưu tập giày hiếm và phiên bản giới hạn chính hãng Jordan, Dior, Nike x Travis Scott được tuyển chọn khắt khe.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1920&q=85",
    linkText: "Khám phá Sneaker",
    secondaryText: "Xem tất cả",
    categoryFilter: 2
  },
  {
    id: 4,
    tag: "Avant-Garde Streetwear",
    title: "Thời Trang Phong Cách",
    subtitle: "Thiết kế phá cách và đương đại từ Balenciaga, Off-White, Fear of God, Chrome Hearts định hình phong cách cá nhân.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85",
    linkText: "Khám phá Streetwear",
    secondaryText: "Xem tất cả",
    categoryFilter: 4
  },
  {
    id: 5,
    tag: "High Jewelry & Gems",
    title: "Trang Sức & Kim Hoàn ",
    subtitle: "Vẻ đẹp vĩnh cửu của vàng khối, kim cương và đá quý tự nhiên từ Cartier, Van Cleef & Arpels, Bvlgari.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=85",
    linkText: "Khám phá Trang Sức",
    secondaryText: "Xem tất cả",
    categoryFilter: 5
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
              <div className="max-w-3xl xl:max-w-4xl space-y-5">
                {slide.tag && (
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-[0.3em] text-[#E0E0DE]">
                    {slide.tag}
                  </span>
                )}

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight leading-[1.2]">
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
