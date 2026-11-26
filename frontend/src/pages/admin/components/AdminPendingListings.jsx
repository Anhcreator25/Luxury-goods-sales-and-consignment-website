import React from 'react'
import { formatPrice } from '../../../utils/formatters'

export default function AdminPendingListings({
  pending,
  loadingListings,
  listingBanner,
  handleOpenDetail,
  handleListingAction,
}) {
  return (
    <div className="space-y-6">
      {/* Banner */}
      {listingBanner && (
        <div className={`px-4 py-3 text-xs font-mono uppercase tracking-wider border-l-2 ${
          listingBanner.type === 'success'
            ? 'bg-[#F2F8F4] border-[#1E7E34] text-[#155724]'
            : 'bg-[#FDF2F2] border-[#D93838] text-[#9A2222]'
        }`}>
          {listingBanner.msg}
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E3]">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-[0.15em] text-[#111111] font-bold">
            Hàng Hiệu Ký Gửi Chờ Thẩm Định
          </h2>
          <p className="text-[11px] text-[#888888] mt-0.5">
            Sản phẩm cần kiểm định nguồn gốc & chất lượng trước khi niêm yết công khai
          </p>
        </div>

        {!loadingListings && (
          <span className="bg-[#111111] text-white text-[10px] font-mono tracking-widest px-2.5 py-1">
            {pending.length} SẢN PHẨM
          </span>
        )}
      </div>

      {loadingListings ? (
        <div className="text-center py-20 text-xs font-mono uppercase tracking-widest text-[#888888] animate-pulse">
          Đang quét kho tin đăng…
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white border border-[#E5E5E3] py-20 text-center">
          <div className="text-3xl mb-3 text-[#111111]">✓</div>
          <p className="text-sm font-serif font-bold text-[#111111]">Không có tin đăng nào cần thẩm định</p>
          <p className="text-xs text-[#888888] mt-1">Toàn bộ sản phẩm ký gửi đã được xử lý xong.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map(listing => {
            const id = listing.id ?? listing._id
            const imgSrc = listing.primary_image
              || (typeof listing.images?.[0] === 'string' ? listing.images[0] : listing.images?.[0]?.image_url)
              || listing.image_url
              || null
            const seller = listing.seller_name ?? listing.seller?.name ?? 'Người Bán'
            const email  = listing.seller_email ?? listing.seller?.email ?? ''

            return (
              <div
                key={id}
                className="bg-white border border-[#E5E5E3] hover:border-[#111111] transition-all duration-300 flex flex-col group"
              >
                {/* Product image container with 4/5 ratio */}
                <div className="relative aspect-[4/5] bg-[#F9F9F8] overflow-hidden flex items-center justify-center border-b border-[#F0F0EE]">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={listing.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
                      }}
                    />
                  ) : (
                    <span className="text-4xl select-none">🖼</span>
                  )}

                  {/* ID Tag */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-[#EAEAE8] text-[9px] font-mono tracking-widest px-2 py-0.5 text-[#111111]">
                    #{id}
                  </span>

                  {/* Condition Badge */}
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-[#EAEAE8] text-[9px] font-mono tracking-widest px-2 py-0.5 text-[#111111] uppercase">
                    {listing.condition_grade ?? listing.condition ?? 'GOOD'}
                  </span>
                </div>

                {/* Info Container */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888888] mb-1">
                      {listing.brand ?? listing.brand_name ?? '—'}
                    </p>
                    <p className="text-sm font-semibold text-[#111111] leading-snug line-clamp-1">
                      {listing.title ?? listing.name ?? 'Sản phẩm không tên'}
                    </p>
                    <p className="text-base font-bold font-mono text-[#111111] mt-1.5">
                      {formatPrice(Number(listing.selling_price) || 0)}
                    </p>
                  </div>

                  <div className="border-t border-[#F0F0EE] pt-2.5 text-[11px]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[#888888] font-mono uppercase text-[9px] tracking-wider">Người bán:</span>
                      <span className="text-[#333333] font-medium truncate max-w-[150px]">{seller}</span>
                    </div>
                    {email && (
                      <p className="text-[#888888] font-mono text-[10px] truncate text-right">{email}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5E3]">
                    <button
                      onClick={() => handleOpenDetail(id)}
                      className="py-2.5 text-[11px] font-mono uppercase tracking-wider bg-[#111111] text-white hover:bg-black transition-colors"
                    >
                      🔍 Soi Ảnh
                    </button>
                    <button
                      onClick={() => handleListingAction(id, 'active')}
                      className="py-2.5 text-[11px] font-mono uppercase tracking-wider border border-[#111111] text-[#111111] hover:bg-[#F5F5F3] transition-colors"
                    >
                      ✓ Duyệt Nhanh
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
