import React, { useState } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";

export default function ProductGallery({ images = [], title, badgeLabel }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mainImageSrc =
    images.length > 0 ? images[activeImage] || images[0] : FALLBACK_IMAGE;

  return (
    <div className="lg:col-span-6 flex flex-col gap-4 sticky top-24">
      {/* Main Stage Image */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="w-full max-w-[460px] mx-auto aspect-square bg-[#F7F7F6] border border-[#EAEAE8] rounded-xl overflow-hidden relative group cursor-zoom-in"
      >
        <img
          src={mainImageSrc}
          alt={title}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-[#E5E5E3] text-[#111111] text-[9px] font-mono tracking-[0.15em] uppercase px-2.5 py-1 rounded-md shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
          Phóng to ⤢
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 max-w-[460px] mx-auto w-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(idx)}
              className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                activeImage === idx
                  ? "border-[#111111] ring-1 ring-[#111111]"
                  : "border-[#EAEAE8] opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${title} - ảnh ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Đóng ảnh phóng to"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(
                    (prev) => (prev - 1 + images.length) % images.length
                  );
                }}
                aria-label="Ảnh trước"
                className="absolute left-4 sm:left-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center transition-colors"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((prev) => (prev + 1) % images.length);
                }}
                aria-label="Ảnh tiếp theo"
                className="absolute right-4 sm:right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center transition-colors"
              >
                →
              </button>
            </>
          )}

          <img
            src={mainImageSrc}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
