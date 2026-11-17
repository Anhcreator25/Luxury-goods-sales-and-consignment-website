import React from 'react'
import { formatPrice, formatDate } from '../../../../utils/formatters'
import OrderProgressStepper from './OrderProgressStepper'

// Order lifecycle status mappings & styling
const STATUS_MAP = {
  pending:    { label: 'Chờ Thanh Toán', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed:  { label: 'Đã Thanh Toán',  cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  processing: { label: 'Đang Chuẩn Bị', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  paid:       { label: 'Đã Thanh Toán', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  shipping:   { label: 'Đang Giao',    cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  completed:  { label: 'Hoàn Thành',  cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled:  { label: 'Đã Hủy',      cls: 'bg-red-50 text-red-700 border border-red-200' },
}

// Order status badge
function StatusBadge({ status, paymentStatus }) {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
        Đã Hủy
      </span>
    )
  }

  if (status === 'completed' || status === 'delivered') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        ✓ Hoàn Thành
      </span>
    )
  }

  if (paymentStatus === 'paid' && (status === 'pending' || status === 'confirmed')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
        🛡️ Đã Ký Quỹ Sàn
      </span>
    )
  }

  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-50 text-gray-700 border border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${s.cls}`}>
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
    <div className="border border-[#E5E5E3] bg-white p-6 hover:border-[#111111] transition-colors duration-150">
      {/* Order header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-1">Mã Đơn Hàng</p>
          <p className="text-sm font-semibold text-[#111111]">#{order.id || order.order_id}</p>
          <p className="text-xs text-[#888888] mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={currentStatus} paymentStatus={order.payment_status} />
          {isUnpaid && (
            <span className="text-[9px] font-mono text-[#856404] bg-[#FFF8E6] px-1.5 py-0.5 border border-[#FFE8A1]">
              Chưa thanh toán
            </span>
          )}
        </div>
      </div>

      {/* 4-step progress stepper */}
      <OrderProgressStepper status={currentStatus} paymentStatus={order.payment_status} />

      <div className="border-t border-[#E5E5E3] my-3" />

      {/* Purchased items list */}
      <div className="space-y-2 mb-4">
        {(order.items || order.order_items || []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-[#888888]">×{item.quantity || 1}</span>
              </div>
              <span className="text-sm text-[#111111]">{item.title || item.product_title || item.name || 'Sản phẩm'}</span>
            </div>
            <span className="text-sm text-[#444444] font-mono">{formatPrice(item.price || item.unit_price || 0)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E5E5E3] my-3" />

      {/* Payment method and total amount summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444]">Phương Thức Thanh Toán</p>
          <p className="text-xs text-[#111111] mt-0.5">
            {order.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : order.payment_method || 'Chuyển khoản ngân hàng'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-0.5">Tổng Cộng</p>
          <p className="text-base font-bold text-[#111111]">{formatPrice(order.total_amount || order.total_price || order.total || 0)}</p>
        </div>
      </div>

      {/* Order actions */}
      <div className="mt-4 pt-3 border-t border-[#F0F0EE] flex flex-wrap items-center justify-end gap-3">
        {isUnpaid && (
          <>
            <button
              onClick={() => onCancelOrder(oid)}
              disabled={cancellingId === oid}
              className="text-xs font-mono uppercase tracking-wider px-3.5 py-2 border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancellingId === oid ? 'Đang hủy...' : '✕ Hủy Đơn Hàng'}
            </button>
            <button
              onClick={() => onOpenPaymentModal(order)}
              className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-4 py-2 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
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
            className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-5 py-2.5 hover:bg-[#2A2A2A] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <span>✓</span>
            <span>{confirmingId === oid ? 'Đang xác nhận...' : 'ĐÃ NHẬN ĐƯỢC HÀNG'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
