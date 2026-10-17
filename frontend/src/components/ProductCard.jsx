import React from "react";
import { formatPrice } from "../utils/formatters";

export default function ProductCard({ product, onSelect, onDetail }) {
  const imageUrl = product.primary_image || 
    (product.images && product.images[0]?.image_url) || 
    (product.images && typeof product.images[0] === 'string' ? product.images[0] : null) ||
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="group bg-white border border-[#E5E5E3] hover:border-[#111111] transition-all duration-200 flex flex-col justify-between">
      {/* Product Image */}
      <div 
        onClick={() => onSelect && onSelect(product.id)}
        className="aspect-square w-full bg-[#FAFAFA] overflow-hidden relative cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";
          }}
        />
        {product.condition_grade && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-1">
            {product.condition_grade}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-grow justify-between border-t border-[#EAEAE8]">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#777777] font-mono uppercase tracking-wider mb-1.5">
            <span className="font-semibold text-[#111111]">{product.brand_name || "Luxury Brand"}</span>
            <span>{product.category_name || "Collection"}</span>
          </div>
          <h3 
            onClick={() => onSelect && onSelect(product.id)}
            className="text-sm font-serif text-[#111111] font-normal leading-snug line-clamp-2 cursor-pointer hover:underline underline-offset-2"
          >
            {product.title}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F0F0EE] flex items-center justify-between">
          <div>
            <div className="text-sm font-mono font-medium text-[#111111]">
              {formatPrice(product.selling_price)}
            </div>
            {product.original_price && product.original_price > product.selling_price && (
              <div className="text-[11px] font-mono text-[#999999] line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onDetail) onDetail(product.id || product);
                else if (onSelect) onSelect(product.id);
              }}
              className="px-3 py-1.5 border border-[#111111] hover:bg-[#111111] hover:text-white text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

