import React, { useState } from 'react'
import { formatPrice } from '../../../utils/formatters'
import { VIETNAMESE_BANKS } from '../../user/components/BankAccountsSection'

// Auto VietQR generator and manual transaction confirmation modal
export default function AdminDisburseModal({ payout, onClose, onConfirm, submitting }) {
  if (!payout) return null

  const [transactionRef, setTransactionRef] = useState('')
  const [note, setNote] = useState('')

  const bankName = payout.default_bank_name || payout.recipient_bank || 'Vietcombank'
  const accountNumber = payout.default_account_number || payout.recipient_account || ''
  const accountHolder = payout.default_account_holder || payout.recipient_name || payout.seller_name || ''
  const netAmount = Math.round(Number(payout.net_payout || (payout.amount - payout.commission_fee)))

  // Resolve bank code for VietQR
  const matchedBank = VIETNAMESE_BANKS.find(b => bankName.toLowerCase().includes(b.code.toLowerCase()) || b.name.toLowerCase().includes(bankName.toLowerCase()))
  const bankCode = matchedBank ? matchedBank.code : 'VCB'
  const transferContent = `AURA DH${payout.order_id}`

  const qrUrl = accountNumber 
    ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${netAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`
    : null

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(payout.payout_id, {
      transaction_ref: transactionRef,
      note: note,
      recipient_bank: bankName,
      recipient_account: accountNumber,
      recipient_name: accountHolder
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div 
        className="bg-[#FBFBFA] w-full max-w-lg p-6 space-y-5 border border-[#E5E5E3] font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#777777]">Giải Ngân Ký Quỹ Aura Vault</p>
            <h3 className="text-base font-bold text-[#111111]">Đơn Hàng #{payout.order_id}</h3>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-[#111111] text-lg leading-none cursor-pointer">
            ✕
          </button>
        </div>

        {/* QR & Banking summary */}
        <div className="bg-white border border-[#E5E5E3] p-4 text-center space-y-4">
          {qrUrl ? (
            <>
              <p className="text-xs text-[#555555]">Quét mã VietQR bằng App ngân hàng để bắn tiền chính xác 100%:</p>
              <img 
                src={qrUrl} 
                alt="VietQR Payout" 
                className="w-48 h-auto mx-auto border border-[#E5E5E3] shadow-sm"
              />
            </>
          ) : (
            <div className="p-4 bg-[#FFF8E6] border border-[#FFE8A1] text-xs text-[#856404]">
              ⚠️ Người bán chưa liên kết tài khoản ngân hàng mặc định trong hồ sơ. Vui lòng liên hệ Người bán để bổ sung.
            </div>
          )}

          <div className="text-left text-xs space-y-2 border-t border-[#E5E5E3] pt-3 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[#777777]">Số tiền thực chuyển (95%):</span>
              <span className="text-base font-bold text-[#111111]">{formatPrice(netAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#777777]">Người nhận (Seller):</span>
              <span className="font-semibold text-[#111111] uppercase">{accountHolder || payout.seller_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#777777]">Ngân hàng:</span>
              <span className="font-semibold text-[#111111]">{bankName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#777777]">Số tài khoản:</span>
              <span className="font-bold text-[#111111]">{accountNumber || 'Chưa cung cấp'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#777777]">Nội dung chuyển khoản:</span>
              <span className="font-bold text-[#1E7E34] bg-[#F2F8F4] px-1.5 py-0.5">{transferContent}</span>
            </div>
          </div>
        </div>

        {/* Confirmation form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1">
              Mã Giao Dịch Ngân Hàng (Mã Bút Toán) <span className="text-[#888888] font-normal">(Tùy chọn)</span>
            </label>
            <input 
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              placeholder="VD: FT2411172901"
              className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3.5 py-2.5 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1">
              Ghi Chú Admin
            </label>
            <input 
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú đối soát nội bộ..."
              className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3.5 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#E5E5E3] text-xs font-mono uppercase tracking-wider hover:bg-[#F0F0EE] transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {submitting ? 'Đang Xử Lý...' : '✓ Xác Nhận Đã Chuyển Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
