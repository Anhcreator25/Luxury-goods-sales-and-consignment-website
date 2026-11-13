import React, { useState } from 'react'
import { formatPrice } from '../utils/formatters'
import { offerServices } from '../services/offerServices'
import { cartServices } from '../services/cartServices'

export default function MakeOfferModal({ isOpen, onClose, product, onSuccess }) {
  if (!isOpen || !product) return null

  const currentPrice = Number(product.selling_price || product.price || 0)
  const [offerPrice, setOfferPrice] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Quick discount calculation buttons (-5%, -10%, -15%)
  const handleQuickPercent = (pct) => {
    const discounted = Math.round(currentPrice * (1 - pct / 100))
    setOfferPrice(discounted.toString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const num = Number(offerPrice)
    if (!num || num <= 0) {
      setError('Vui lòng nhập giá đề xuất hợp lệ')
      return
    }

    if (num >= currentPrice) {
      setError('Giá đề xuất phải thấp hơn giá niêm yết hiện tại')
      return
    }

    if (num < currentPrice * 0.3) {
      setError('Giá đề xuất tối thiểu là 30% giá niêm yết')
      return
    }

    setLoading(true)
    try {
      await offerServices.createOffer({
        listing_id: product.id,
        offered_price: num,
        buyer_note: note.trim(),
      })

      //automatically add products to the shopping cart so users can keep track of them
      try {
        await cartServices.addToCart(product.id, 1)
        window.dispatchEvent(new Event('cart-updated'))
      } catch (cartErr) {
      
      }

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.message || err?.response?.data?.message || 'Không thể gửi đề xuất giá.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5E5E3] max-w-md w-full p-6 shadow-2xl relative font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888888] hover:text-[#111111] text-base cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#F0F0EE] pb-4 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#888888] block mb-1">
            Haute Négociation
          </span>
          <h2 className="text-xl font-serif text-[#111111] font-normal">
            Đề Xuất Mức Giá Mong Muốn
          </h2>
          <p className="text-xs text-[#666666] font-mono mt-1 line-clamp-1">
            {product.title}
          </p>
        </div>

        {/* Current Price Banner */}
        <div className="bg-[#FBFBFA] border border-[#EAEAE8] p-3.5 mb-5 flex justify-between items-center font-mono">
          <span className="text-xs text-[#777777] uppercase tracking-wider">Giá Niêm Yết:</span>
          <span className="text-sm font-semibold text-[#111111]">{formatPrice(currentPrice)}</span>
        </div>

        {error && (
          <div className="mb-4 bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] p-2.5 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Select Buttons */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#555555] mb-1.5">
              Chọn Nhanh Mức Giảm:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="py-1.5 px-2 bg-white border border-[#E5E5E3] hover:border-[#111111] text-xs font-mono text-[#333333] hover:text-[#111111] transition-all cursor-pointer"
                >
                  Giảm {pct}% (-{formatPrice(Math.round(currentPrice * (pct / 100)))})
                </button>
              ))}
            </div>
          </div>

          {/* Offer Price Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#555555] mb-1.5">
              Mức Giá Bạn Đề Xuất (₫) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="Ví dụ: 650000000"
              className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
            />
            {offerPrice && Number(offerPrice) > 0 && (
              <p className="text-[11px] font-mono text-[#28A745] mt-1">
                = {formatPrice(Number(offerPrice))} (Tiết kiệm {formatPrice(currentPrice - Number(offerPrice))})
              </p>
            )}
          </div>

          {/* Message to Seller */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#555555] mb-1.5">
              Lời Nhắn Đến Người Bán (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Em thiện chí chốt cọc trong ngày nếu anh/chị đồng ý giá này ạ."
              className="w-full border border-[#E5E5E3] bg-[#FAFAFA] p-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 border border-[#E5E5E3] text-xs font-mono uppercase tracking-widest text-[#666666] hover:bg-[#F5F5F3] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 bg-[#111111] text-white hover:bg-[#2B2B2B] text-xs font-mono uppercase tracking-[0.2em] transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? 'Đang Gửi...' : 'Gửi Đề Xuất Giá →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
