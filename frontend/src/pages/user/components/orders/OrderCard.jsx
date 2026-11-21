import React from 'react'
import { formatPrice, formatDate } from '../../../../utils/formatters'
import OrderProgressStepper from './OrderProgressStepper'

// Order lifecycle status mappings & styling
const STATUS_MAP = {
  pending:    { label: 'Chờ Thanh Toán', cls: 'bg-amber-50 text-amber-800 border border-amber-200/80' },
  confirmed:  { label: 'Đã Thanh Toán',  cls: 'bg-purple-50 text-purple-800 border border-purple-200/80' },
  processing: { label: 'Đang Chuẩn Bị', cls: 'bg-blue-50 text-blue-800 border border-blue-200/80' },
  paid:       { label: 'Đã Thanh Toán', cls: 'bg-purple-50 text-purple-800 border border-purple-200/80' },
  shipping:   { label: 'Đang Giao',    cls: 'bg-indigo-50 text-indigo-800 border border-indigo-200/80' },
  completed:  { label: 'Hoàn Thành',  cls: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' },
  cancelled:  { label: 'Đã Hủy',      cls: 'bg-red-50 text-red-800 border border-red-200/80' },
}

// Order status badge
function StatusBadge({ status, paymentStatus }) {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-red-50 text-red-800 border border-red-200/80">
        Đã Hủy
      </span>
    )
  }

  if (status === 'completed' || status === 'delivered') {
    return (
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200/80">
        ✓ Hoàn Thành
      </span>
    )
  }

  if (paymentStatus === 'paid' && (status === 'pending' || status === 'confirmed')) {
    return (
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-purple-50 text-purple-800 border border-purple-200/80">
        🛡️ Đã Ký Quỹ Sàn
      </span>
    )
  }

  const s = STATUS_MAP[status] || { label: status, cls: 'bg-stone-50 text-stone-700 border border-stone-200' }
  return (
    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-widest ${s.cls}`}>
      {s.label}
    </span>
  )
}

// Individual order card display with progress stepper and action triggers
export default function OrderCard({ 
  order, 
  onOpenPaymentModal, 
  onCancelOrder, 
  onConfirmReceipt,
  cancellingId,
  confirmingId 
}) {
  const isUnpaid = (order.payment_status === 'pending' || !order.payment_status) && (order.status === 'pending' || order.order_status === 'pending')
  const oid = order.id || order.order_id
  const currentStatus = order.order_status || order.status
  const isPaid = order.payment_status === 'paid' || ['confirmed', 'shipping'].includes(currentStatus)
  const canConfirmReceipt = isPaid && currentStatus !== 'completed' && currentStatus !== 'cancelled'

  return (
    <div className="border border-[#E8E8E6] bg-white p-6 sm:p-8 hover:border-[#111111] transition-all duration-300">
      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Mã Đơn Hàng</p>
          <p className="text-sm font-mono tracking-widest font-semibold text-[#111111]">#{order.id || order.order_id}</p>
          <p className="text-[11px] font-mono text-[#888888] mt-1">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
          <StatusBadge status={currentStatus} paymentStatus={order.payment_status} />
          {isUnpaid && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#856404] bg-[#FFF8E6] px-2.5 py-0.5 border border-[#FFE8A1]">
              Chưa thanh toán
            </span>
          )}
        </div>
      </div>

      {/* 4-step progress stepper */}
      <div className="py-2">
        <OrderProgressStepper status={currentStatus} paymentStatus={order.payment_status} />
      </div>

      <div className="border-t border-[#E8E8E6] my-6" />

      {/* Purchased items list */}
      <div className="space-y-3 mb-6">
        {(order.items || order.order_items || []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 bg-[#F9F9F8] border border-[#E8E8E6] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-mono text-[#888888]">×{item.quantity || 1}</span>
              </div>
              <span className="text-sm font-medium text-[#111111]">{item.title || item.product_title || item.name || 'Sản phẩm'}</span>
            </div>
            <span className="text-sm text-[#333333] font-mono whitespace-nowrap">{formatPrice(item.price || item.unit_price || 0)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E8E8E6] my-6" />

      {/* Payment method and total amount summary */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Phương Thức Thanh Toán</p>
          <p className="text-xs text-[#111111]">
            {order.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : order.payment_method || 'Chuyển khoản ngân hàng'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Tổng Cộng</p>
          <p className="text-base sm:text-lg font-mono font-bold text-[#111111]">{formatPrice(order.total_amount || order.total_price || order.total || 0)}</p>
        </div>
      </div>

      {/* Order actions */}
      {(isUnpaid || canConfirmReceipt) && (
        <div className="mt-6 pt-5 border-t border-[#E8E8E6] flex flex-wrap items-center justify-end gap-3.5">
          {isUnpaid && (
            <>
              <button
                onClick={() => onCancelOrder(oid)}
                disabled={cancellingId === oid}
                className="text-xs font-mono uppercase tracking-widest px-4 py-2.5 border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {cancellingId === oid ? 'Đang hủy...' : '✕ Hủy Đơn Hàng'}
              </button>
              <button
                onClick={() => onOpenPaymentModal(order)}
                className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-6 py-2.5 hover:bg-black transition-all duration-300 cursor-pointer"
              >
                Quét Mã Thanh Toán Ngay →
              </button>
            </>
          )}

          {/* Buyer delivery receipt confirmation */}
          {canConfirmReceipt && (
            <button
              onClick={() => onConfirmReceipt(oid)}
              disabled={confirmingId === oid}
              className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-6 py-3 hover:bg-black transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <span>✓</span>
              <span>{confirmingId === oid ? 'Đang xác nhận...' : 'ĐÃ NHẬN ĐƯỢC HÀNG'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
