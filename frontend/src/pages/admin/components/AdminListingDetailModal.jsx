import React from 'react'
import { formatPrice } from '../../../utils/formatters'

export default function AdminListingDetailModal({
  selectedListing,
  setSelectedListing,
  loadingDetail,
  detailImageIdx,
  setDetailImageIdx,
  handleListingAction,
}) {
  if (!loadingDetail && !selectedListing) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setSelectedListing(null)}
    >
      <div
        className="bg-[#FBFBFA] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E3]">
          <p className="text-xs font-mono uppercase tracking-wider text-[#111111]">Chi Tiết Tin Đăng</p>
          <button
            onClick={() => setSelectedListing(null)}
            className="text-[#888888] hover:text-[#111111] text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {loadingDetail ? (
          <div className="py-20 text-center text-xs font-mono uppercase tracking-wider text-[#888888] animate-pulse">
            Đang tải…
          </div>
        ) : selectedListing && (
          <div className="grid md:grid-cols-2 gap-0">
            {/* LEFT: image gallery */}
            <div className="bg-[#F5F5F4] p-4 flex flex-col gap-3">
              {/* Main image */}
              <div className="aspect-square bg-white border border-[#E5E5E3] flex items-center justify-center overflow-hidden">
                {selectedListing.images?.length > 0 ? (
                  <img
                    src={selectedListing.images[detailImageIdx]?.image_url}
                    alt={selectedListing.title}
                    className="w-full h-full object-contain p-3"
                  />
                ) : selectedListing.primary_image ? (
                  <img
                    src={selectedListing.primary_image}
                    alt={selectedListing.title}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <span className="text-5xl select-none">🖼</span>
                )}
              </div>
              {/* Thumbnails */}
              {selectedListing.images?.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedListing.images.map((img, i) => (
                    <button
                      key={img.id ?? i}
                      onClick={() => setDetailImageIdx(i)}
                      className={`w-14 h-14 overflow-hidden border-2 transition-colors ${
                        i === detailImageIdx ? 'border-[#111111]' : 'border-transparent'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: info + seller + actions */}
            <div className="p-6 flex flex-col gap-5">
              {/* Brand & title */}
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-1">
                  {selectedListing.brand_name ?? selectedListing.brand ?? '—'}
                </p>
                <h3 className="text-lg font-bold text-[#111111] leading-snug">
                  {selectedListing.title ?? 'Sản phẩm không tên'}
                </h3>
                <p className="text-xs font-mono text-[#888888] mt-0.5">
                  Mã tin: #{selectedListing.id} · Danh mục: {selectedListing.category_name ?? selectedListing.category ?? '—'}
                </p>
              </div>

              {/* Price & Condition */}
              <div className="flex items-baseline gap-4 py-3 border-y border-[#E5E5E3]">
                <div>
                  <p className="text-xs text-[#888888] mb-0.5">Giá bán</p>
                  <p className="text-xl font-bold font-mono text-[#111111]">
                    {formatPrice(Number(selectedListing.selling_price) || 0)}
                  </p>
                </div>
                {selectedListing.original_price && (
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">Giá gốc</p>
                    <p className="text-sm font-mono text-[#888888] line-through">
                      {formatPrice(Number(selectedListing.original_price))}
                    </p>
                  </div>
                )}
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#888888] mb-0.5">Tình trạng</p>
                  <span className="text-xs font-mono uppercase border border-[#111111] px-2 py-0.5 text-[#111111]">
                    {selectedListing.condition_grade ?? selectedListing.condition ?? '—'}
                  </span>
                </div>
              </div>

              {/* Authenticity Certificate Box */}
              <div className={`p-4 border text-xs font-mono ${
                selectedListing.certificate_code
                  ? 'bg-[#F2F8F4] border-[#1E7E34] text-[#155724]'
                  : 'bg-[#FFF8E6] border-[#856404] text-[#856404]'
              }`}>
                <p className="font-bold uppercase tracking-wider mb-1">
                  {selectedListing.certificate_code ? '✓ Đã Có Chứng Nhận Thẩm Định' : '⚠ Chưa Có Chứng Nhận'}
                </p>
                {selectedListing.certificate_code ? (
                  <div className="space-y-0.5 text-[11px] opacity-90">
                    <p>Mã chứng nhận: <span className="font-bold">{selectedListing.certificate_code}</span></p>
                    {selectedListing.authenticity_status && (
                      <p>Trạng thái: {selectedListing.authenticity_status}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] opacity-80">Sản phẩm này cần kiểm tra kỹ trước khi duyệt hiển thị công khai.</p>
                )}
              </div>

              {/* Description */}
              {selectedListing.description && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-1">Mô Tả Sản Phẩm</p>
                  <p className="text-xs text-[#555555] leading-relaxed whitespace-pre-line max-h-28 overflow-y-auto bg-white p-2 border border-[#E5E5E3]">
                    {selectedListing.description}
                  </p>
                </div>
              )}

              {/* Seller info (admin-only fields) */}
              <div className="border border-[#E5E5E3] p-3 bg-white">
                <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-2">Thông Tin Người Bán</p>
                <div className="space-y-1 text-sm">
                  <p className="text-[#333333] font-semibold">
                    {selectedListing.seller_name ?? 'Không rõ'}
                  </p>
                  {selectedListing.seller_email && (
                    <p className="text-[#666666] font-mono text-xs">{selectedListing.seller_email}</p>
                  )}
                  {selectedListing.seller_phone && (
                    <p className="text-[#333333] font-mono">📞 {selectedListing.seller_phone}</p>
                  )}
                </div>
              </div>

              {/* Approve / Reject */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => {
                    handleListingAction(selectedListing.id, 'active')
                    setSelectedListing(null)
                  }}
                  className="flex-1 py-3 text-xs font-mono uppercase tracking-wider border border-[#1E7E34] text-[#1E7E34] hover:bg-[#1E7E34] hover:text-white transition-colors"
                >
                  ✓ Duyệt Tin
                </button>
                <button
                  onClick={() => {
                    handleListingAction(selectedListing.id, 'rejected')
                    setSelectedListing(null)
                  }}
                  className="flex-1 py-3 text-xs font-mono uppercase tracking-wider border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors"
                >
                  ✕ Từ Chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

