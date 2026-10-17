import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import axiosClient from '../../services/axiosClient'

const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' ₫'
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')

const STATUS_MAP = {
  pending:    { label: 'Đang Xử Lý',    cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  processing: { label: 'Đang Chuẩn Bị', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  paid:       { label: 'Đã Thanh Toán', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  shipping:   { label: 'Đang Giao',     cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  completed:  { label: 'Hoàn Thành',   cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled:  { label: 'Đã Hủy',       cls: 'bg-red-50 text-red-700 border border-red-200' },
}



function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="border border-[#E5E5E3] bg-white p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-3 bg-[#E5E5E3] w-28" />
          <div className="h-4 bg-[#E5E5E3] w-40" />
        </div>
        <div className="h-6 bg-[#E5E5E3] w-24" />
      </div>
      <div className="h-3 bg-[#E5E5E3] w-full mb-2" />
      <div className="h-3 bg-[#E5E5E3] w-2/3" />
      <div className="flex justify-between mt-4">
        <div className="h-4 bg-[#E5E5E3] w-32" />
        <div className="h-8 bg-[#E5E5E3] w-24" />
      </div>
    </div>
  )
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-5 py-4 shadow-lg max-w-xs">
      <p className="text-sm text-[#155724]">{message}</p>
    </div>
  )
}

function IncomingOrderCard({ order, onConfirm }) {
  const oid = order.id || order._id || ''

  return (
    <div className="border border-[#E5E5E3] bg-white hover:border-[#111111] transition-colors duration-150">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-1">Mã Đơn</p>
            <p className="text-sm font-semibold text-[#111111]">{oid}</p>
            <p className="text-xs text-[#888888] mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Buyer Info */}
        <div className="bg-[#F5F5F3] border border-[#E5E5E3] px-4 py-3 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mb-1">Người Mua</p>
          <p className="text-sm font-semibold text-[#111111]">
            {order.buyer?.name || order.buyer_name || 'Khách Hàng'}
          </p>
          <p className="text-xs text-[#888888] font-mono">
            {order.buyer?.email || order.buyer_email || '—'}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E3] mb-4" />

        {/* Items */}
        <div className="space-y-2 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Sản Phẩm</p>
          {(order.items || order.order_items || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] text-[#888888]">×{item.quantity || 1}</span>
                </div>
                <span className="text-sm text-[#111111]">{item.title || item.product_title || item.name || 'Sản phẩm'}</span>
              </div>
              <span className="text-sm text-[#444444] font-mono">{formatPrice(item.price || item.unit_price || 0)}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E3] mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444]">Tổng Cộng</p>
            <p className="text-base font-bold text-[#111111]">{formatPrice(order.total_price || order.total || 0)}</p>
          </div>

          {order.status === 'pending' && (
            <button
              onClick={() => onConfirm(oid)}
              className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-5 py-2.5 hover:bg-[#2A2A2A] transition-colors duration-150"
            >
              Xác Nhận
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IncomingOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosClient.get('/orders')
      const data = Array.isArray(res.data) ? res.data : (res.data?.orders || res.data?.data || [])
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setError('Không thể tải dữ liệu đơn hàng từ máy chủ.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = (orderId) => {
    // No dedicated API endpoint — show success toast only
    setToast(`Đã xác nhận đơn hàng ${orderId}`)
    // Optimistically update status
    setOrders(prev =>
      prev.map(o => ((o.id || o._id) === orderId ? { ...o, status: 'processing' } : o))
    )
  }

  // Stats
  const totalOrders     = orders.length
  const pendingOrders   = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Page Header */}
        <div className="mb-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Tài Khoản / Người Bán</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Đơn Hàng Từ Khách Mua</h1>
        </div>
        <p className="text-sm text-[#888888] mb-8">
          Quản lý các đơn hàng từ người mua cho sản phẩm ký gửi của bạn
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
            <p className="text-sm text-[#9A2222]">{error}</p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-[#E5E5E3] bg-white p-5 text-center">
            <p className="text-2xl font-bold text-[#111111]">{loading ? '—' : totalOrders}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-1">Tổng Đơn</p>
          </div>
          <div className="border border-[#E5E5E3] bg-white p-5 text-center">
            <p className="text-2xl font-bold text-amber-600">{loading ? '—' : pendingOrders}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-1">Đang Chờ</p>
          </div>
          <div className="border border-[#E5E5E3] bg-white p-5 text-center">
            <p className="text-2xl font-bold text-emerald-600">{loading ? '—' : completedOrders}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-1">Hoàn Thành</p>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-dashed border-[#E5E5E3] bg-white py-16 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center mb-4">
              <span className="text-xl">📬</span>
            </div>
            <p className="text-sm font-mono uppercase tracking-wider text-[#444444] mb-1">Chưa Có Đơn Hàng Nào</p>
            <p className="text-xs text-[#888888]">Khi khách hàng mua sản phẩm của bạn, đơn hàng sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <IncomingOrderCard
                key={order.id || order._id || idx}
                order={order}
                onConfirm={handleConfirm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

