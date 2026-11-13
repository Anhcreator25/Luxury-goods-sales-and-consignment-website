import React from "react";
import { formatPrice, formatConditionGrade } from "../utils/formatters";

export default function ProductCard({ product, onSelect, onDetail }) {
  const imageUrl = product.primary_image || 
    (product.images && product.images[0]?.image_url) || 
    (product.images && typeof product.images[0] === 'string' ? product.images[0] : null) ||
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";

  return (
    <div 
      onClick={() => {
        if (onDetail) onDetail(product.id || product);
        else if (onSelect) onSelect(product.id);
      }}
      className="group bg-white border border-[#E8E8E6] hover:border-[#111111] transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="aspect-[4/5] w-full bg-[#F9F9F8] overflow-hidden relative">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";
          }}
        />

        {/* Delicate Frosted Glass Condition Badge */}
        {product.condition_grade && (
          <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md border border-[#EAEAE8] text-[#222222] text-[9px] font-mono uppercase tracking-[0.18em] px-2.5 py-1 shadow-sm">
            {formatConditionGrade(product.condition_grade)}
          </div>
        )}

        {/* Verification Check Badge */}
        <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-md border border-[#EAEAE8] text-[#555555] text-[9px] font-mono tracking-widest px-2 py-1 shadow-sm">
          ✓ Verified
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between border-t border-[#F0F0EE]">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#888888] mb-1.5">
            <span className="font-medium text-[#111111]">{product.brand_name || "Maison"}</span>
            <span className="text-[#999999]">{product.category_name || "Vault"}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-serif text-[#111111] font-normal leading-snug line-clamp-1 group-hover:underline underline-offset-4 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Refined Action */}
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

          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#666666] group-hover:text-[#111111] transition-colors">
            <span>Chi tiết</span>
            <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
