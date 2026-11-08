import React from 'react'
import { formatPrice } from '../../../utils/formatters'
import { PLATFORM_CONFIG } from '../../../config/platformConfig'

export default function AdminStatsCards({ stats, loadingStats }) {
  const cards = [
    {
      label: 'Tổng Doanh Thu',
      value: loadingStats ? '—' : formatPrice(stats.revenue),
      sub: 'Từ đơn thanh toán thành công',
    },
    {
      label: `Hoa Hồng Sàn (${PLATFORM_CONFIG.commissionPercent}%)`,
      value: loadingStats ? '—' : formatPrice(stats.commission),
      sub: `${PLATFORM_CONFIG.commissionPercent}% trên đơn thành công`,
    },
    {
      label: 'Đơn Thành Công',
      value: loadingStats ? '—' : stats.paidOrders.toLocaleString(),
      sub: `${stats.pendingOrders} chờ • ${stats.cancelledOrders} huỷ • ${stats.orders} tổng`,
    },
    {
      label: 'Sản Phẩm Đang Bán',
      value: loadingStats ? '—' : stats.products.toLocaleString(),
      sub: 'Tin đăng đang hoạt động',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white border border-[#E5E5E3] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-3">
            {card.label}
          </p>
          <p className="text-2xl font-bold text-[#111111] leading-none mb-2">
            {card.value}
          </p>
          <p className="text-xs text-[#888888]">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}

