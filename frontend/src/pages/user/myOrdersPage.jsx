import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { orderServices } from '../../services'
import { formatPrice, formatDate } from '../../utils/formatters'

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

// Order filtering tab categories
const TABS = [
  { key: 'all',       label: 'Tất Cả' },
  { key: 'pending',   label: 'Chờ Thanh Toán' },
  { key: 'confirmed', label: 'Đã Thanh Toán' },
  { key: 'shipping',  label: 'Đang Giao' },
  { key: 'completed', label: 'Hoàn Thành' },
  { key: 'cancelled', label: 'Đã Hủy' },
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
function StatusBadge({ status, paymentStatus }) {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
        Đã Hủy
      </span>
    )
  }

  if (paymentStatus === 'paid' && status === 'pending') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
        Đã Thanh Toán
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

// Single order card display with item list and total
function OrderCard({ order, onOpenPaymentModal, onCancelOrder, cancellingId }) {
  const isUnpaid = (order.payment_status === 'pending' || !order.payment_status) && (order.status === 'pending' || order.order_status === 'pending')
  const oid = order.id || order.order_id

  return (
    <div className="border border-[#E5E5E3] bg-white p-6 hover:border-[#111111] transition-colors duration-150">
      {/* Header with order code and timestamp */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-1">Mã Đơn Hàng</p>
          <p className="text-sm font-semibold text-[#111111]">{order.id || order.order_id || `#${String(order.id ?? '').slice(-6).toUpperCase()}`}</p>
          <p className="text-xs text-[#888888] mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.order_status || order.status} paymentStatus={order.payment_status} />
          {isUnpaid && (
            <span className="text-[9px] font-mono text-[#856404] bg-[#FFF8E6] px-1.5 py-0.5 border border-[#FFE8A1]">
              Chưa thanh toán
            </span>
          )}
        </div>
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
          <p className="text-xs text-[#111111] mt-0.5">
            {order.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : order.payment_method || 'Chuyển khoản ngân hàng'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#444444] mb-0.5">Tổng Cộng</p>
          <p className="text-base font-bold text-[#111111]">{formatPrice(order.total_amount || order.total_price || order.total || 0)}</p>
        </div>
      </div>

      {/* Action buttons if order is pending */}
      {isUnpaid && (
        <div className="mt-4 pt-3 border-t border-[#F0F0EE] flex items-center justify-end gap-3">
          <button
            onClick={() => onCancelOrder(oid)}
            disabled={cancellingId === oid}
            className="text-xs font-mono uppercase tracking-wider px-3.5 py-2 border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors disabled:opacity-50"
          >
            {cancellingId === oid ? 'Đang hủy...' : '✕ Hủy Đơn Hàng'}
          </button>
          <button
            onClick={() => onOpenPaymentModal(order)}
            className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-4 py-2 hover:bg-[#2A2A2A] transition-colors"
          >
            Quét Mã Thanh Toán Ngay →
          </button>
        </div>
      )}
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
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Selected order for repayment popup
  const [payOrder, setPayOrder] = useState(null)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

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

  const handleConfirmPay = async (orderId) => {
    setConfirmingPayment(true)
    try {
      await orderServices.simulatePayment(orderId)
      setPayOrder(null)
      setSuccessMsg('Thanh toán đơn hàng thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchOrders()
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi khi xác nhận thanh toán.')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Sản phẩm sẽ được mở lại để người khác có thể mua.')
    if (!confirmCancel) return

    setCancellingId(orderId)
    setError('')
    setSuccessMsg('')
    try {
      const res = await orderServices.cancelOrder(orderId)
      setSuccessMsg(res.data?.message || 'Đã hủy đơn hàng thành công.')
      setTimeout(() => setSuccessMsg(''), 4000)
      if (payOrder && (payOrder.id === orderId || payOrder.order_id === orderId)) {
        setPayOrder(null)
      }
      fetchOrders()
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể hủy đơn hàng này. Vui lòng thử lại.')
    } finally {
      setCancellingId(null)
    }
  }

  // Filter orders according to selected tab
  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => (o.status === activeTab || o.order_status === activeTab))

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

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-4 py-3">
            <p className="text-sm text-[#155724]">{successMsg}</p>
          </div>
        )}

        {/* Tab Filter Bar */}
        <div className="flex border-b border-[#E5E5E3] mb-6 overflow-x-auto">
          {TABS.map(tab => {
            const count = tab.key === 'all'
              ? orders.length
              : orders.filter(o => o.status === tab.key || o.order_status === tab.key).length

            return (
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
                <span className="ml-1.5 text-[9px]">({count})</span>
              </button>
            )
          })}
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
              <OrderCard
                key={order.id || order._id || idx}
                order={order}
                onOpenPaymentModal={(ord) => setPayOrder(ord)}
                onCancelOrder={handleCancelOrder}
                cancellingId={cancellingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment QR Modal if user clicks pay again */}
      {payOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPayOrder(null)}
        >
          <div
            className="bg-[#FBFBFA] w-full max-w-md p-6 space-y-6 relative border border-[#E5E5E3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#111111]">
                Thanh Toán Đơn Hàng #{payOrder.id || payOrder.order_id}
              </p>
              <button
                onClick={() => setPayOrder(null)}
                className="text-[#888888] hover:text-[#111111] text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="bg-white border border-[#E5E5E3] p-4 text-center space-y-4">
              {(() => {
                const envBankCode = import.meta.env.VITE_PLATFORM_BANK_CODE || 'MB'
                const envBankAccount = import.meta.env.VITE_PLATFORM_BANK_ACCOUNT || '0822173222'
                const envBankName = import.meta.env.VITE_PLATFORM_BANK_NAME || 'MBBank (Quân Đội)'
                const envAccountName = import.meta.env.VITE_PLATFORM_BANK_HOLDER || 'LUXURY PLATFORM'
                const amount = Math.round(payOrder.total_amount || payOrder.total_price || 0)
                const oid = payOrder.id || payOrder.order_id
                const qrUrl = `https://img.vietqr.io/image/${envBankCode}-${envBankAccount}-compact2.png?amount=${amount}&addInfo=DH${oid}&accountName=${encodeURIComponent(envAccountName)}`

                return (
                  <>
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
                  </>
                )
              })()}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCancelOrder(payOrder.id || payOrder.order_id)}
                disabled={cancellingId === (payOrder.id || payOrder.order_id)}
                className="flex-1 py-3 border border-[#D93838] text-[#D93838] text-xs font-mono uppercase tracking-wider hover:bg-[#D93838] hover:text-white transition-colors disabled:opacity-50"
              >
                {cancellingId === (payOrder.id || payOrder.order_id) ? 'Đang hủy...' : 'Hủy Đơn Này'}
              </button>
              <button
                onClick={() => handleConfirmPay(payOrder.id || payOrder.order_id)}
                disabled={confirmingPayment}
                className="flex-[2] bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
              >
                {confirmingPayment ? 'Đang xác nhận...' : '✓ Tôi Đã Chuyển Khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
