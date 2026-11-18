import React from 'react';
import { formatPrice } from '../../../../utils/formatters';

export default function CartItemCard({
  item,
  isSelected,
  onToggleSelect,
  onCheckoutSingle,
  onDelete,
  isDeleting,
}) {
  const itemId = item.cart_item_id || item.id;
  const listing = item.listing ?? item;
  const thumb = item.primary_image || (listing?.images && listing.images[0]) || listing?.image_url || null;
  const price = item.selling_price ?? listing?.selling_price ?? listing?.price ?? item.price ?? 0;
  const brand = item.brand_name || listing?.brand_name || listing?.brand || item.brand || '';
  const condition = item.condition_grade || listing?.condition_grade || item.condition || '';
  const title = item.title || listing?.title || 'Sản phẩm xa xỉ';

  return (
    <div
      className={`flex gap-3 sm:gap-4 border p-4 transition-colors bg-white ${
        isSelected ? 'border-[#111111]' : 'border-[#E5E5E3] hover:border-[#CCCCCC]'
      }`}
    >
      {/* Checkbox Select */}
      <div className="flex items-center pt-2 sm:pt-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(itemId)}
          className="w-4 h-4 accent-[#111111] cursor-pointer"
          title="Chọn sản phẩm này để thanh toán"
        />
      </div>

      {/* Thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#F5F5F4] overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#CCCCCC]" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 min-w-0">
        {brand && (
          <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-0.5">
            {brand}
          </p>
        )}
        <p className="text-sm font-medium text-[#111111] line-clamp-2 leading-snug">
          {title}
        </p>
        {condition && (
          <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider border border-[#E5E5E3] px-2 py-0.5 text-[#666666]">
            {condition}
          </span>
        )}
        <p className="mt-2 text-sm font-mono text-[#111111]">
          {formatPrice(price)}
        </p>

        {/* Offer Negotiation Status Badges */}
        {item.latest_offer_status === 'pending' && (
          <div className="mt-2 p-2 bg-[#FFFDF5] border border-[#FBEEC1] text-xs font-mono space-y-0.5">
            <p className="text-amber-800 font-semibold flex items-center gap-1">
              <span>⏳</span>
              <span>Đang chờ duyệt giá: {formatPrice(item.latest_offered_price || 0)}</span>
            </p>
            <p className="text-[10px] text-amber-700">
              Người bán đang xem xét mức giá bạn đề xuất.
            </p>
          </div>
        )}

        {item.latest_offer_status === 'accepted' && (
          item.accepted_offer_id ? (
            <div className="mt-2 p-2 bg-[#F2F8F4] border border-[#C3E6CB] text-xs font-mono space-y-0.5">
              <p className="text-emerald-800 font-semibold flex items-center gap-1">
                <span>🎉</span>
                <span>Giá ưu đãi đã duyệt: {formatPrice(price)}</span>
              </p>
              <p className="text-[10px] text-emerald-700">
                Tiết kiệm {formatPrice(Number(item.original_listing_price || price) - Number(price))} (áp dụng trong 24h).
              </p>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-[#F5F5F4] border border-[#E0E0DE] text-xs font-mono space-y-0.5">
              <p className="text-[#666666] font-semibold flex items-center gap-1">
                <span>⚠️</span>
                <span>Ưu đãi giá đề xuất đã hết hạn (quá 24 giờ)</span>
              </p>
              <p className="text-[10px] text-[#888888]">
                Sản phẩm đã tự động trở về giá bán niêm yết: {formatPrice(price)}.
              </p>
            </div>
          )
        )}

        {item.latest_offer_status === 'rejected' && (
          <div className="mt-2 p-2 bg-[#FDF2F2] border border-[#F5C6CB] text-xs font-mono space-y-0.5">
            <p className="text-red-800 font-semibold flex items-center gap-1">
              <span>✕</span>
              <span>Người bán đã từ chối giá {formatPrice(item.latest_offered_price || 0)}</span>
            </p>
            <p className="text-[10px] text-red-700">
              Sản phẩm hiện áp dụng mức giá niêm yết ban đầu.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#F0F0EE]">
          <p className="text-xs text-[#888888]">Số lượng: {item.quantity || 1}</p>

          {/* Single Item Checkout Action */}
          <button
            type="button"
            onClick={() => onCheckoutSingle(item)}
            className="text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#2A2A2A] font-semibold flex items-center gap-1 bg-[#F5F5F4] hover:bg-[#EBEBEA] px-3 py-1.5 transition-colors border border-[#E5E5E3] cursor-pointer"
          >
            <span>Mua riêng món này</span>
            <span className="text-[10px]">→</span>
          </button>
        </div>
      </div>

      {/* Delete Item */}
      <div className="flex-shrink-0">
        <button
          onClick={() => onDelete(itemId)}
          disabled={isDeleting}
          aria-label="Xóa sản phẩm"
          className="w-8 h-8 flex items-center justify-center border border-[#E5E5E3] text-[#666666] hover:border-[#D93838] hover:text-[#D93838] transition-colors disabled:opacity-40 cursor-pointer"
        >
          {isDeleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <span className="text-xs font-bold leading-none">✕</span>
          )}
        </button>
      </div>
    </div>
  );
}
