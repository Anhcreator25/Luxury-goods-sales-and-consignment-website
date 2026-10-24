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
        <div className={`px-4 py-3 text-sm border-l-2 ${
          listingBanner.type === 'success'
            ? 'bg-[#F2F8F4] border-[#1E7E34] text-[#155724]'
            : 'bg-[#FDF2F2] border-[#D93838] text-[#9A2222]'
        }`}>
          {listingBanner.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#444444]">
          Tin Đăng Chờ Duyệt
          {!loadingListings && (
            <span className="ml-2 bg-[#111111] text-white text-[10px] px-2 py-0.5">
              {pending.length}
            </span>
          )}
        </h2>
      </div>

      {loadingListings ? (
        <div className="text-center py-16 text-xs font-mono uppercase tracking-wider text-[#888888] animate-pulse">
          Đang tải…
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white border border-[#E5E5E3] py-20 text-center">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-sm text-[#666666]">Không có tin đăng nào cần duyệt</p>
          <p className="text-xs text-[#999999] mt-1">Mọi tin đăng đã được xử lý.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map(listing => {
            const id     = listing.id ?? listing._id
            const imgSrc = listing.primary_image
              || (typeof listing.images?.[0] === 'string' ? listing.images[0] : listing.images?.[0]?.image_url)
              || listing.image_url
              || null
            const seller = listing.seller_name ?? listing.seller?.name ?? 'Người Bán'
            const email  = listing.seller_email ?? listing.seller?.email ?? ''

            return (
              <div key={id} className="bg-white border border-[#E5E5E3] flex flex-col">
                {/* Product image */}
                <div className="h-40 sm:h-44 bg-[#F0F0EE] flex items-center justify-center overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt={listing.title} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-4xl select-none">🖼</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-0.5">
                      {listing.brand ?? '—'}
                    </p>
                    <p className="text-sm font-semibold text-[#111111] leading-snug line-clamp-2">
                      {listing.title ?? listing.name ?? 'Sản phẩm không tên'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#111111]">
                      {formatPrice(Number(listing.selling_price) || 0)}
                    </span>
                    <span className="text-xs border border-[#E5E5E3] px-2 py-0.5 text-[#666666] font-mono uppercase">
                      {listing.condition_grade ?? listing.condition ?? '—'}
                    </span>
                  </div>

                  <div className="border-t border-[#E5E5E3] pt-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#444444]">Người Đăng</p>
                    <p className="text-sm text-[#333333] mt-0.5">{seller}</p>
                    {email && <p className="text-xs text-[#888888]">{email}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-1">
                    <button
                      onClick={() => handleOpenDetail(id)}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                    >
                      👁 Chi Tiết
                    </button>
                    <button
                      onClick={() => handleListingAction(id, 'active')}
                      className="flex-1 py-2 text-xs font-mono uppercase tracking-wider border border-[#1E7E34] text-[#1E7E34] hover:bg-[#1E7E34] hover:text-white transition-colors"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleListingAction(id, 'rejected')}
                      className="flex-1 py-2 text-xs font-mono uppercase tracking-wider border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors"
                    >
                      Từ Chối
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

