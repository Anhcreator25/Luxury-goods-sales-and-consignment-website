import React from 'react'
import { formatPrice } from '../../../../utils/formatters'

// Payment QR modal for re-attempting unpaid orders
export default function PaymentQRModal({ 
  order, 
  onClose, 
  onCancelOrder, 
  onConfirmPay, 
  cancellingId, 
  confirmingPayment 
}) {
  if (!order) return null

  const envBankCode = import.meta.env.VITE_PLATFORM_BANK_CODE || 'MB'
  const envBankAccount = import.meta.env.VITE_PLATFORM_BANK_ACCOUNT || '0822173222'
  const envBankName = import.meta.env.VITE_PLATFORM_BANK_NAME || 'MBBank (Quân Đội)'
  const envAccountName = import.meta.env.VITE_PLATFORM_BANK_HOLDER || 'LUXURY PLATFORM'
  const amount = Math.round(order.total_amount || order.total_price || 0)
  const oid = order.id || order.order_id
  const qrUrl = `https://img.vietqr.io/image/${envBankCode}-${envBankAccount}-compact2.png?amount=${amount}&addInfo=DH${oid}&accountName=${encodeURIComponent(envAccountName)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FBFBFA] w-full max-w-md p-6 space-y-6 relative border border-[#E5E5E3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#111111]">
            Thanh Toán Đơn Hàng #{oid}
          </p>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#111111] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="bg-white border border-[#E5E5E3] p-4 text-center space-y-4">
          <img
            src={qrUrl}
            alt="VietQR"
            className="w-48 h-auto mx-auto border border-[#E5E5E3]"
          />

          <div className="text-left text-xs space-y-2 border-t border-[#E5E5E3] pt-3">
            <div className="flex justify-between">
              <span className="text-[#888888]">Số tiền:</span>
              <span className="font-bold text-[#111111]">{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888888]">Ngân hàng:</span>
              <span className="font-semibold text-[#111111]">{envBankName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888888]">STK:</span>
              <span className="font-mono font-semibold text-[#111111]">{envBankAccount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888888]">Chủ TK:</span>
              <span className="font-semibold text-[#111111] uppercase">{envAccountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888888]">Nội dung CK:</span>
              <span className="font-mono font-bold text-[#1E7E34] bg-[#F2F8F4] px-1.5 py-0.5">
                DH{oid}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onCancelOrder(oid)}
            disabled={cancellingId === oid}
            className="flex-1 py-3 border border-[#D93838] text-[#D93838] text-xs font-mono uppercase tracking-wider hover:bg-[#D93838] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancellingId === oid ? 'Đang hủy...' : 'Hủy Đơn Này'}
          </button>
          <button
            onClick={() => onConfirmPay(oid)}
            disabled={confirmingPayment}
            className="flex-[2] bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {confirmingPayment ? 'Đang xác nhận...' : '✓ Tôi Đã Chuyển Khoản'}
          </button>
        </div>
      </div>
    </div>
  )
}
