import React, { useState, useRef, useEffect } from 'react'
import { formatPrice } from '../../../utils/formatters'

// Renders inspection modal with image zoom and authenticity checklist
export default function AdminListingDetailModal({
  selectedListing,
  setSelectedListing,
  loadingDetail,
  detailImageIdx,
  setDetailImageIdx,
  handleListingAction,
}) {
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' })
  const [isZooming, setIsZooming] = useState(false)
  const imageContainerRef = useRef(null)

  const [checklist, setChecklist] = useState({
    logo: false,
    serial: false,
    hardware: false,
    condition: false,
  })

  useEffect(() => {
    setChecklist({
      logo: false,
      serial: false,
      hardware: false,
      condition: false,
    })
    setZoomStyle({ display: 'none' })
    setIsZooming(false)
  }, [selectedListing?.id])

  if (!loadingDetail && !selectedListing) return null

  const currentImage = selectedListing?.images?.[detailImageIdx]?.image_url
    || selectedListing?.primary_image
    || null

  // Updates zoom lens position based on cursor coordinates
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${currentImage})`,
    })
    setIsZooming(true)
  }

  // Hides zoom lens when cursor leaves image container
  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' })
    setIsZooming(false)
  }

  // Toggles an authenticity checklist item
  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allPassed = Object.values(checklist).every(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 sm:p-6"
      onClick={() => setSelectedListing(null)}
    >
      <div
        className="bg-[#FBFBFA] w-full max-w-5xl max-h-[92vh] overflow-y-auto border border-[#333333] shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E3] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-[#111111] text-white px-2 py-0.5">
              Inspector Studio
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-[#111111] font-semibold">
              Thẩm Định Chi Tiết Sản Phẩm #{selectedListing?.id}
            </p>
          </div>
          <button
            onClick={() => setSelectedListing(null)}
            className="text-[#888888] hover:text-[#111111] text-lg font-mono p-1 transition-colors"
          >
            ✕ Đóng
          </button>
        </div>

        {loadingDetail ? (
          <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#888888] animate-pulse">
            Đang tải dữ liệu sản phẩm…
          </div>
        ) : selectedListing && (
          <div className="grid lg:grid-cols-12 gap-0">
            {/* LEFT 7 COLS: High-Res Interactive Inspector Zoom */}
            <div className="lg:col-span-7 bg-[#F5F5F4] p-6 border-b lg:border-b-0 lg:border-r border-[#E5E5E3] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
                  🔍 Rê chuột để soi zoom chi tiết da, chỉ khâu & logo
                </span>
                <span className="text-[10px] font-mono text-[#888888]">
                  Ảnh {detailImageIdx + 1} / {selectedListing.images?.length || 1}
                </span>
              </div>

              {/* Main Image Container */}
              <div
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative aspect-[4/5] bg-white border border-[#E5E5E3] overflow-hidden cursor-crosshair flex items-center justify-center group"
              >
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={selectedListing.title}
                    className="w-full h-full object-contain p-4 select-none"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
                    }}
                  />
                ) : (
                  <span className="text-5xl select-none">🖼</span>
                )}

                {/* Loupe / Zoom Lens Overlay */}
                {isZooming && currentImage && (
                  <div
                    style={zoomStyle}
                    className="absolute inset-0 pointer-events-none bg-no-repeat bg-[length:250%] z-20 border border-[#111111]/30 transition-none"
                  />
                )}
              </div>

              {/* Thumbnails */}
              {selectedListing.images?.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {selectedListing.images.map((img, i) => (
                    <button
                      key={img.id ?? i}
                      onClick={() => setDetailImageIdx(i)}
                      className={`w-16 h-20 shrink-0 bg-white overflow-hidden border-2 transition-all ${
                        i === detailImageIdx ? 'border-[#111111] shadow-md scale-102' : 'border-[#E5E5E3] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT 5 COLS: Details & Checklist & Action */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between gap-6 bg-white">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-[#888888] mb-1">
                    {selectedListing.brand_name ?? selectedListing.brand ?? '—'}
                  </p>
                  <h3 className="text-xl font-bold font-serif text-[#111111] leading-snug">
                    {selectedListing.title ?? 'Sản phẩm không tên'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#888888] mt-1">
                    Mã sản phẩm: #{selectedListing.id} · Danh mục: {selectedListing.category_name ?? selectedListing.category ?? '—'}
                  </p>
                </div>

                {/* Price & Condition */}
                <div className="flex items-baseline justify-between py-3.5 border-y border-[#E5E5E3]">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#888888] mb-0.5">Giá Ký Gửi Niêm Yết</p>
                    <p className="text-2xl font-bold font-mono text-[#111111]">
                      {formatPrice(Number(selectedListing.selling_price) || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase text-[#888888] mb-0.5">Độ Mới Khảo Sát</p>
                    <span className="text-xs font-mono uppercase border border-[#111111] bg-[#FBFBFA] px-2.5 py-1 text-[#111111] font-semibold">
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
                  <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    {selectedListing.certificate_code ? '✓ Chứng Nhận Thẩm Định Sẵn Có' : '⚠ Chưa Có Hồ Sơ Thẩm Định Độc Lập'}
                  </p>
                  {selectedListing.certificate_code ? (
                    <div className="space-y-0.5 text-[11px]">
                      <p>Mã chứng nhận: <span className="font-bold underline">{selectedListing.certificate_code}</span></p>
                      {selectedListing.authenticity_status && (
                        <p>Trạng thái: {selectedListing.authenticity_status}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px]">Admin thẩm định viên cần soi ảnh đối chiếu kỹ trước khi cho phép mở bán.</p>
                  )}
                </div>

                {/* Authenticity Inspector Checklist */}
                <div className="border border-[#E5E5E3] p-4 bg-[#FBFBFA]">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#111111] font-bold mb-3">
                    Checklist Thẩm Định Nhanh
                  </p>
                  <div className="space-y-2 text-xs">
                    {[
                      { key: 'logo', label: 'Font chữ, dập chìm & logo sắc nét' },
                      { key: 'serial', label: 'Mã date code / số serial trùng khớp' },
                      { key: 'hardware', label: 'Chất liệu kim loại, khóa kéo & phụ kiện zin' },
                      { key: 'condition', label: 'Tình trạng thực tế đúng như mô tả' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checklist[item.key]}
                          onChange={() => toggleCheck(item.key)}
                          className="w-4 h-4 accent-[#111111]"
                        />
                        <span className={`text-[11px] ${checklist[item.key] ? 'text-[#111111] font-medium' : 'text-[#666666]'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Seller Info */}
                <div className="border-t border-[#E5E5E3] pt-3 text-xs">
                  <p className="font-mono uppercase text-[#888888] text-[10px] tracking-wider mb-1">
                    Người Bán Ký Gửi
                  </p>
                  <p className="text-[#111111] font-semibold">{selectedListing.seller_name ?? '—'}</p>
                  <p className="text-[#666666] font-mono text-[11px]">{selectedListing.seller_email ?? ''}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-[#E5E5E3]">
                <button
                  onClick={() => {
                    handleListingAction(selectedListing.id, 'active')
                    setSelectedListing(null)
                  }}
                  className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all ${
                    allPassed
                      ? 'bg-[#111111] text-white hover:bg-black shadow-md'
                      : 'border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
                  }`}
                >
                  ✓ Duyệt Mở Bán
                </button>
                <button
                  onClick={() => {
                    handleListingAction(selectedListing.id, 'rejected')
                    setSelectedListing(null)
                  }}
                  className="px-5 py-3 text-xs font-mono uppercase tracking-wider border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors"
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
