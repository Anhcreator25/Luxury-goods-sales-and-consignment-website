import React, { useState, useEffect } from 'react'
import { adminServices } from '../../../services'
import { formatPrice, formatDate } from '../../../utils/formatters'
import AdminPagination from './AdminPagination'

// Visual status badges
const STATUS_LABEL = {
  confirmed:  { text: 'Đã Thanh Toán', cls: 'bg-[#F2F8F4] text-[#155724]' },
  paid:       { text: 'Đã Thanh Toán', cls: 'bg-[#F2F8F4] text-[#155724]' },
  completed:  { text: 'Hoàn Thành',    cls: 'bg-[#F2F8F4] text-[#155724]' },
  processing: { text: 'Đang Chuẩn Bị', cls: 'bg-[#EBF3FE] text-[#1D4ED8]' },
  shipping:   { text: 'Đang Giao',    cls: 'bg-[#EBF3FE] text-[#1D4ED8]' },
  pending:    { text: 'Chờ Thanh Toán', cls: 'bg-[#FFF8E6] text-[#856404]' },
  cancelled:  { text: 'Đã Huỷ',        cls: 'bg-[#FDF2F2] text-[#9A2222]' },
}

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 })

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')
        const res = await adminServices.getOrders({
          page,
          limit: pagination.limit,
          status: statusFilter,
          search: search.trim()
        })
        if (!isMounted) return
        const data = res.data || res || {}
        setOrders(data.orders || [])
        setPagination({
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          limit: data.limit || 10
        })
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load orders:', err)
        setError(err?.response?.data?.message || 'Không thể tải danh sách đơn hàng.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }, search ? 400 : 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [page, statusFilter, search])

  return (
    <div className="bg-white border border-[#E5E5E3] font-sans">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
          Sổ Quản Lý Đơn Hàng ({pagination.total})
        </h2>

        {/* Controls: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-56 text-xs px-3 py-1.5 bg-[#FBFBFA] border border-[#E5E5E3] focus:border-[#111111] focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#111111]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all',       label: 'Tất Cả' },
              { id: 'paid',      label: 'Đã TT' },
              { id: 'pending',   label: 'Chờ TT' },
              { id: 'cancelled', label: 'Đã Huỷ' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id)
                  setPage(1)
                }}
                className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 transition-colors border cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#FBFBFA] text-[#666666] border-[#E5E5E3] hover:text-[#111111]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="m-4 bg-[#FDF2F2] border-l-2 border-[#D93838] p-3 text-xs text-[#9A2222]">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E3] bg-[#FBFBFA]">
              {['Mã ĐH', 'Người Mua', 'Sản Phẩm Đặt Mua', 'Tổng Tiền', 'Trạng Thái', 'Thời Gian'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E3]">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-xs font-mono text-[#888888] animate-pulse">
                  Đang tải danh sách đơn hàng…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-xs font-mono text-[#888888]">
                  Không tìm thấy đơn hàng nào trong mục này.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const prod = o.items && o.items.length > 0
                  ? o.items.map(it => it.title).filter(Boolean).join(', ')
                  : 'Sản phẩm Aura Vault'
                const total = Number(o.total_amount || 0)
                const rawStatus = (o.order_status || 'pending').toLowerCase()
                
                const isPaid = o.payment_status === 'paid' || ['confirmed', 'completed', 'shipping'].includes(rawStatus)
                const isCancelled = rawStatus === 'cancelled'
                const statusKey = isCancelled ? 'cancelled' : (isPaid ? 'confirmed' : 'pending')
                const badge = STATUS_LABEL[statusKey] ?? { text: rawStatus, cls: 'bg-[#F3F4F6] text-[#374151]' }

                return (
                  <tr key={o.order_id} className="hover:bg-[#FBFBFA] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#111111]">
                      #{o.order_id}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-medium text-[#111111]">{o.buyer_name || 'Khách hàng'}</p>
                      <p className="text-[11px] font-mono text-[#888888]">{o.buyer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#333333] max-w-[240px] truncate" title={prod}>
                      {prod}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#111111] font-semibold">
                      {formatPrice(total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#888888]">
                      {formatDate ? formatDate(o.created_at) : (o.created_at?.slice(0, 10) || '—')}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Shared Pagination Component */}
      <AdminPagination
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        itemLabel="đơn"
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  )
}
