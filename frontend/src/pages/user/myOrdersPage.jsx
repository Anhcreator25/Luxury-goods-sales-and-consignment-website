import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { orderServices } from '../../services'
import { formatPrice, formatDate } from '../../utils/formatters'

// Order lifecycle status mappings & styling
const STATUS_MAP = {
  pending:    { label: 'Đang Xử Lý',  cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  processing: { label: 'Đang Chuẩn Bị', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  paid:       { label: 'Đã Thanh Toán', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  shipping:   { label: 'Đang Giao',    cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  completed:  { label: 'Hoàn Thành',  cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled:  { label: 'Đã Hủy',      cls: 'bg-red-50 text-red-700 border border-red-200' },
}

// Order filtering tab categories
const TABS = [
  { key: 'all',      label: 'Tất Cả' },
  { key: 'pending',  label: 'Đang Xử Lý' },
  { key: 'shipping', label: 'Đang Giao' },
  { key: 'completed',label: 'Hoàn Thành' },
]

// Animated loading placeholder for order cards
function SkeletonCard() {
  return (
    <div className="border border-[#E5E5E3] bg-white p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-4 bg-[#E5E5E3] w-32" />
        <div className="h-6 bg-[#E5E5E3] w-24" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-[#E5E5E3] w-full" />
        <div className="h-3 bg-[#E5E5E3] w-3/4" />
      </div>
      <div className="flex justify-end">
        <div className="h-5 bg-[#E5E5E3] w-28" />
      </div>
    </div>
  )
}

// Order status pill component
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-50 text-gray-700 border border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  )
}

// Single order card display with item list and total
function OrderCard({ order }) {
  return (
    <div className="border border-[#E5E5E3] bg-white p-6 hover:border-[#111111] transition-colors duration-150">
      {/* Header with order code and timestamp */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-1">Mã Đơn Hàng</p>
          <p className="text-sm font-semibold text-[#111111]">{order.id || order._id || `#${String(order.id ?? '').slice(-6).toUpperCase()}`}</p>
          <p className="text-xs text-[#888888] mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

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

      {/* Summary with payment method and grand total */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444]">Phương Thức Thanh Toán</p>
          <p className="text-xs text-[#111111] mt-0.5">{order.payment_method || 'Không xác định'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-0.5">Tổng Cộng</p>
          <p className="text-base font-bold text-[#111111]">{formatPrice(order.total_price || order.total || 0)}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * My Orders Page: Displays purchase order history and delivery statuses for the authenticated user.
 */
export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Redirect to login if user is not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [])

  // Fetch purchase orders from API
  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await orderServices.getOrders()
      const data = Array.isArray(res.data) ? res.data : (res.data?.orders || res.data?.data || [])
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setError('Không thể kết nối đến máy chủ lấy danh sách đơn hàng.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Filter orders according to selected tab
  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab)

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Tài Khoản</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Đơn Hàng Của Tôi</h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
            <p className="text-sm text-[#9A2222]">{error}</p>
          </div>
        )}

        {/* Tab Filter Bar */}
        <div className="flex border-b border-[#E5E5E3] mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors duration-150 ${
                activeTab === tab.key
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#888888] hover:text-[#444444]'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-[9px]">
                  ({orders.filter(o => o.status === tab.key).length})
                </span>
              )}
              {tab.key === 'all' && (
                <span className="ml-1.5 text-[9px]">({orders.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-[#E5E5E3] bg-white py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center mb-4">
              <span className="text-xl">📦</span>
            </div>
            <p className="text-sm font-mono uppercase tracking-wider text-[#444444] mb-1">Chưa Có Đơn Hàng Nào</p>
            <p className="text-xs text-[#888888] mb-6">Bắt đầu mua sắm ngay để thấy đơn hàng tại đây.</p>
            <Link
              to="/shop"
              className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-6 py-2.5 hover:bg-[#2A2A2A] transition-colors duration-150"
            >
              Khám Phá Cửa Hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, idx) => (
              <OrderCard key={order.id || order._id || idx} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
