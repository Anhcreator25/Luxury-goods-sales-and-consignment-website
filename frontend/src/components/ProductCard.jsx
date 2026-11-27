import React from "react";
import { formatPrice, formatConditionShort } from "../utils/formatters";

export default function ProductCard({ product, onSelect, onDetail }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";

  const getImageUrl = (img) => {
    if (!img) return null;
    return typeof img === "string" ? img : img.image_url || null;
  };

  const imageUrl =
    product.primary_image ||
    getImageUrl(product.images?.[0]) ||
    fallbackImage;

  const secondaryImageUrl =
    product.images && product.images.length > 1
      ? getImageUrl(product.images[1])
      : null;

  const discountPercent =
    product.original_price && product.original_price > product.selling_price
      ? Math.round(
          ((product.original_price - product.selling_price) /
            product.original_price) *
            100
        )
      : 0;

  return (
    <div
      onClick={() => {
        if (onDetail) onDetail(product.id || product);
        else if (onSelect) onSelect(product.id);
      }}
      className="group bg-white rounded-xl overflow-hidden border border-[#D4D4D0] shadow-[0_2px_12px_rgba(17,17,17,0.04)] hover:border-[#111111] hover:shadow-[0_16px_40px_-12px_rgba(17,17,17,0.12)] hover:-translate-y-0.5 transition-all duration-500 ease-out flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="aspect-[4/5] w-full bg-[#F9F9F8] overflow-hidden relative">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />

        {/* Secondary Image Swap on Hover */}
        {secondaryImageUrl && secondaryImageUrl !== imageUrl && (
          <img
            src={secondaryImageUrl}
            alt={`${product.title} - góc nhìn khác`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Subtle Bottom Vignette on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Discount Badge (Top Left) */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-[#111111] text-white text-[11px] font-mono font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Verification Check Badge (Top Right) */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-[#EAEAE8] text-[#111111] text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] inline-block" />
          <span>Verified</span>
        </div>

        {/* Delicate Frosted Glass Condition Badge (Bottom Left, fades on hover to make room for Quick Action) */}
        {product.condition_grade && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md border border-[#EAEAE8] text-[#222222] text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-md shadow-sm font-medium transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-1">
            {formatConditionShort(product.condition_grade)}
          </div>
        )}

        {/* Quick Action Bar (Slides up on Hover) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="w-full py-2.5 bg-white/95 backdrop-blur-md border border-[#EAEAE8] text-[#111111] hover:bg-[#111111] hover:text-white hover:border-[#111111] text-[10px] font-mono uppercase tracking-[0.2em] text-center rounded-lg transition-colors duration-300 shadow-sm">
            Xem Chi Tiết
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between border-t border-[#e5e4e2]">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#888888] mb-2">
            <span className="font-medium text-[#111111] truncate pr-2">
              {product.brand_name || "Maison"}
            </span>
            <span className="text-[#999999] shrink-0">
              {product.category_name || "Vault"}
            </span>
          </div>

          {/* Product Title (2-line consistent height) */}
          <h3 className="text-sm font-serif text-[#111111] font-normal leading-snug line-clamp-2 min-h-[2.45rem] group-hover:underline underline-offset-4 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price */}
        <div className="mt-4 pt-3 border-t border-[#F5F5F3] flex items-baseline justify-between">
          <div>
            <div className="text-sm font-mono font-medium text-[#111111]">
              {formatPrice(product.selling_price)}
            </div>
            {product.original_price && product.original_price > product.selling_price && (
              <div className="text-[10px] font-mono text-[#AAAAAA] line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
