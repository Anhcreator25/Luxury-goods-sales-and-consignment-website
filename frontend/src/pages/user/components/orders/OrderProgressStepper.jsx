import React from 'react'

// 4-step order progress stepper
export default function OrderProgressStepper({ status, paymentStatus }) {
  const isCancelled = status === 'cancelled'
  const isPaid = paymentStatus === 'paid' || ['confirmed', 'processing', 'shipping', 'delivered', 'completed'].includes(status)
  const isShipping = ['shipping', 'delivered', 'completed'].includes(status)
  const isDelivered = status === 'completed' || status === 'delivered'

  if (isCancelled) {
    return (
      <div className="bg-[#FFF5F5] border border-[#FED7D7] p-3 text-center my-3">
        <p className="text-xs font-mono text-[#C53030]">✕ Đơn hàng đã được hủy bỏ và sản phẩm đã mở lại trên sàn.</p>
      </div>
    )
  }

  const steps = [
    { num: '1', label: 'Đặt Hàng', done: true },
    { num: '2', label: 'Ký Quỹ Sàn', done: isPaid },
    { num: '3', label: 'Đang Giao', done: isShipping },
    { num: '4', label: 'Đã Nhận Hàng', done: isDelivered },
  ]

  return (
    <div className="my-4 py-2 bg-[#FAF9F7] border border-[#EFECE6] px-4">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute left-6 right-6 top-3.5 h-[1.5px] bg-[#E5E5E3] -z-0" />
        
        {steps.map((st, i) => (
          <div key={i} className="flex flex-col items-center relative z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                st.done
                  ? 'bg-[#111111] text-white ring-2 ring-white'
                  : 'bg-white text-[#999999] border border-[#CCCCCC]'
              }`}
            >
              {st.done ? '✓' : st.num}
            </div>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider mt-1.5 whitespace-nowrap ${
                st.done ? 'text-[#111111] font-semibold' : 'text-[#888888]'
              }`}
            >
              {st.label}
            </span>
          </div>
        ))}
      </div>

      {isPaid && !isDelivered && (
        <div className="mt-3 pt-2 border-t border-[#EAE7E0] flex items-center gap-1.5 text-[11px] font-mono text-[#2B6CB0]">
          <span>🛡️</span>
          <span>Tiền đang được bảo đảm tại Quỹ Ký Quỹ Aura Vault cho đến khi bạn xác nhận nhận hàng.</span>
        </div>
      )}
    </div>
  )
}
