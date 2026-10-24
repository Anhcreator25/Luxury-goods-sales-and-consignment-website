import React from 'react'
import { formatPrice } from '../../../utils/formatters'

// Order status visual badges
const STATUS_LABEL = {
  confirmed:  { text: 'Đã Thanh Toán', cls: 'bg-[#F2F8F4] text-[#155724]' },
  paid:       { text: 'Đã Thanh Toán', cls: 'bg-[#F2F8F4] text-[#155724]' },
  completed:  { text: 'Hoàn Thành',    cls: 'bg-[#F2F8F4] text-[#155724]' },
  processing: { text: 'Đang Chuẩn Bị', cls: 'bg-[#EBF3FE] text-[#1D4ED8]' },
  shipping:   { text: 'Đang Giao',    cls: 'bg-[#EBF3FE] text-[#1D4ED8]' },
  pending:    { text: 'Chờ Thanh Toán', cls: 'bg-[#FFF8E6] text-[#856404]' },
  cancelled:  { text: 'Đã Huỷ',        cls: 'bg-[#FDF2F2] text-[#9A2222]' },
}

export default function AdminOrdersTable({ 
  orders, 
  stats, 
  orderFilter, 
  setOrderFilter 
}) {
  return (
    <div className="bg-white border border-[#E5E5E3]">
      <div className="px-6 py-4 border-b border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
          Quản Lý Đơn Hàng ({orders.length})
        </h2>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all',       label: 'Tất Cả',          count: stats.orders },
            { id: 'paid',      label: 'Đã Thanh Toán',   count: stats.paidOrders },
            { id: 'pending',   label: 'Chờ Thanh Toán',  count: stats.pendingOrders },
            { id: 'cancelled', label: 'Đã Huỷ',          count: stats.cancelledOrders },
          ].map(tab => {
            const active = orderFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrderFilter(tab.id)}
                className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 transition-colors border ${
                  active
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#FBFBFA] text-[#666666] border-[#E5E5E3] hover:text-[#111111] hover:border-[#111111]'
                }`}
              >
                {tab.label} <span className="opacity-70">({tab.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E3] bg-[#FBFBFA]">
              {['Mã ĐH', 'Người Mua', 'Sản Phẩm', 'Tổng Tiền', 'Trạng Thái', 'Ngày'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs font-mono text-[#888888]">
                  Không có đơn hàng nào trong mục này.
                </td>
              </tr>
            ) : (
              orders.map((o, i) => {
                const sid    = o.order_id ?? o.id ?? o._id ?? `#${i + 1}`
                const buyer  = o.buyer_name || o.buyer || o.user || '—'
                const prod   = o.items && o.items.length > 0
                  ? o.items.map(it => it.title || it.product_title).filter(Boolean).join(', ')
                  : (o.product ?? o.product_name ?? o.listing_title ?? '—')
                const total  = Number(o.total_amount ?? o.total_price ?? o.total ?? 0)
                const rawStatus = (o.order_status || o.status || 'pending').toLowerCase()
                
                // Trạng thái badge
                const isPaid = o.payment_status === 'paid' || ['confirmed', 'completed', 'shipping'].includes(rawStatus)
                const isCancelled = rawStatus === 'cancelled'
                const statusKey = isCancelled ? 'cancelled' : (isPaid ? 'confirmed' : 'pending')
                const badge  = STATUS_LABEL[statusKey] ?? { text: rawStatus, cls: 'bg-[#F3F4F6] text-[#374151]' }
                const date   = o.date ?? o.created_at?.slice(0, 10) ?? '—'

                return (
                  <tr key={sid} className="border-b border-[#E5E5E3] hover:bg-[#FBFBFA] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#111111]">#{sid}</td>
                    <td className="px-4 py-3 text-[#333333] font-medium">{buyer}</td>
                    <td className="px-4 py-3 text-[#333333] max-w-[220px] truncate" title={prod}>{prod}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#111111] font-semibold">
                      {total > 0 ? formatPrice(total) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono uppercase tracking-wider px-2 py-1 ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#888888]">{date}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

