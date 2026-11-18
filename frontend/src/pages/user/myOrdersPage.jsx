import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ConfirmModal from '../../components/ConfirmModal'
import { orderServices, offerServices, cartServices } from '../../services'
import { formatPrice } from '../../utils/formatters'
import OrderCard from './components/orders/OrderCard'
import PaymentQRModal from './components/orders/PaymentQRModal'

// Order filtering tab categories
const TABS = [
  { key: 'all',       label: 'Tất Cả' },
  { key: 'pending',   label: 'Chờ Thanh Toán' },
  { key: 'confirmed', label: 'Đã Thanh Toán' },
  { key: 'shipping',  label: 'Đang Giao' },
  { key: 'completed', label: 'Hoàn Thành' },
  { key: 'cancelled', label: 'Đã Hủy' },
]

/**
 * Kiểm tra xem đề xuất giá đã quá hạn 24 giờ hay chưa
 * @param {string|Date} createdAt 
 * @returns {{ isExpired: boolean, hoursLeft: number, minutesLeft: number }}
 */
function checkOfferExpiry(createdAt) {
  if (!createdAt) return { isExpired: false, hoursLeft: 24, minutesLeft: 0 };
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - createdTime;
  const totalLimitMs = 24 * 60 * 60 * 1000;
  
  if (diffMs >= totalLimitMs) {
    return { isExpired: true, hoursLeft: 0, minutesLeft: 0 };
  }
  
  const remainingMs = totalLimitMs - diffMs;
  const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutesLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  return { isExpired: false, hoursLeft, minutesLeft };
}

// Animated skeleton placeholder for orders list loading
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

// My Orders Page: Displays purchase orders and delivery progress
export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [sentOffers, setSentOffers] = useState([])
  const [activeSection, setActiveSection] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Repayment & action states
  const [payOrder, setPayOrder] = useState(null)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  // Custom Confirmation Dialog Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Xác Nhận',
    variant: 'primary',
    onConfirm: () => {},
    isLoading: false,
  })

  // Redirect to login or admin based on session
  useEffect(() => {
    const token = localStorage.getItem('token')
    const rawUser = localStorage.getItem('user')
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const u = JSON.parse(rawUser || '{}')
      if (u?.role === 'admin') {
        navigate('/admin', { replace: true })
        return
      }
    } catch {
      // ignore JSON parse error
    }
    fetchOrders()
    fetchSentOffers()
  }, [])

  // Fetch sent price negotiation offers
  const fetchSentOffers = async () => {
    try {
      const res = await offerServices.getSentOffers()
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setSentOffers(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Lỗi lấy danh sách đề xuất giá đã gửi:', err)
    }
  }

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

  // Confirm simulated manual payment
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

  // Cancel an unpaid pending order
  const handleCancelOrder = (orderId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy Đơn Hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?\n\nSau khi hủy, đơn hàng sẽ không thể khôi phục và sản phẩm sẽ được mở lại để người mua khác có thể tiếp cận.',
      confirmLabel: 'Hủy Đơn Hàng',
      variant: 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }))
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
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }))
          fetchOrders()
        } catch (err) {
          setError(err?.response?.data?.message || 'Không thể hủy đơn hàng này. Vui lòng thử lại.')
          setConfirmModal((prev) => ({ ...prev, isLoading: false }))
        } finally {
          setCancellingId(null)
        }
      },
    })
  }

  // Buyer confirms delivery receipt to complete order
  const handleConfirmReceipt = (orderId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác Nhận Đã Nhận Hàng',
      message: 'Bạn xác nhận đã nhận được đầy đủ sản phẩm và đồng ý hoàn tất đơn hàng?\n\nSau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái Hoàn Thành và tiền mua hàng sẽ được mở khóa từ hệ thống ký quỹ để giải ngân cho Người bán.',
      confirmLabel: 'Đã Nhận & Hoàn Tất',
      variant: 'success',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }))
        setConfirmingId(orderId)
        setError('')
        setSuccessMsg('')
        try {
          const res = await orderServices.confirmReceipt(orderId)
          setSuccessMsg(res.data?.message || 'Đã xác nhận nhận hàng thành công! Đơn hàng hoàn tất.')
          setTimeout(() => setSuccessMsg(''), 5000)
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }))
          await fetchOrders()
          setActiveTab('completed')
        } catch (err) {
          setError(err?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận nhận hàng.')
          setConfirmModal((prev) => ({ ...prev, isLoading: false }))
        } finally {
          setConfirmingId(null)
        }
      },
    })
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
            <p className="text-sm text-[#9A2222]">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-4 py-3">
            <p className="text-sm text-[#155724]">{successMsg}</p>
          </div>
        )}

        {/* Section Switcher: Purchase Orders vs Sent Offers */}
        <div className="flex border-b border-[#E5E5E3] mb-6">
          <button
            onClick={() => setActiveSection('orders')}
            className={`py-3 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeSection === 'orders'
                ? 'border-[#111111] text-[#111111] font-bold'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            Đơn Mua Của Tôi ({orders.length})
          </button>
          <button
            onClick={() => setActiveSection('offers')}
            className={`py-3 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'offers'
                ? 'border-[#111111] text-[#111111] font-bold'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <span>Đề Xuất Giá Đã Gửi</span>
            {sentOffers.length > 0 && (
              <span className="bg-[#111111] text-white text-[9px] px-2 py-0.5 rounded-full">
                {sentOffers.length}
              </span>
            )}
          </button>
        </div>

        {activeSection === 'orders' ? (
          <>
            {/* Filter Tabs */}
            <div className="flex border-b border-[#E5E5E3] mb-6 overflow-x-auto">
              {TABS.map(tab => {
                const count = tab.key === 'all'
                  ? orders.length
                  : orders.filter(o => o.status === tab.key || o.order_status === tab.key).length

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors duration-150 cursor-pointer ${
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

            {/* Orders List Content */}
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
                    onConfirmReceipt={handleConfirmReceipt}
                    cancellingId={cancellingId}
                    confirmingId={confirmingId}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Sent Offers Section */
          <div className="space-y-4">
            {sentOffers.length === 0 ? (
              <div className="border border-dashed border-[#E5E5E3] bg-white py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center mb-4">
                  <span className="text-xl">🏷️</span>
                </div>
                <p className="text-sm font-mono uppercase tracking-wider text-[#444444] mb-1">Bạn Chưa Đề Xuất Giá Món Đồ Nào</p>
                <p className="text-xs text-[#888888] mb-6">Khi xem sản phẩm, bạn có thể bấm "Thương Lượng / Đề Xuất Giá" để trả giá với người bán.</p>
                <Link
                  to="/shop"
                  className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-6 py-2.5 hover:bg-[#2A2A2A] transition-colors duration-150"
                >
                  Xem Sản Phẩm Ngay
                </Link>
              </div>
            ) : (
              sentOffers.map((offer) => {
                const expiry = offer.status === 'accepted' ? checkOfferExpiry(offer.created_at) : null;
                const isExpired = expiry?.isExpired;

                return (
                  <div key={offer.id} className="border border-[#E5E5E3] bg-white p-5 space-y-4 shadow-sm font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0EE] pb-3">
                      <div className="flex items-center gap-3">
                        {offer.primary_image && (
                          <img src={offer.primary_image} alt="" className="w-14 h-14 object-cover border border-[#E5E5E3]" />
                        )}
                        <div>
                          <h4 className="text-sm font-serif font-medium text-[#111111]">{offer.listing_title}</h4>
                          <div className="text-xs font-mono text-[#777777] mt-0.5">
                            Người bán: <span className="text-[#111111] font-medium">{offer.seller_name || 'Nhà Sưu Tầm Aura'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {offer.status === 'accepted' ? (
                          isExpired ? (
                            <span className="text-[10px] font-mono uppercase px-3 py-1 border font-medium bg-[#F5F5F4] text-[#777777] border-[#E0E0DE]">
                              ✕ Ưu Đãi Đã Hết Hạn (Quá 24h)
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono uppercase px-3 py-1 border font-medium bg-emerald-50 text-emerald-700 border-emerald-300">
                              ✓ Người Bán Đã Đồng Ý
                            </span>
                          )
                        ) : offer.status === 'rejected' ? (
                          <span className="text-[10px] font-mono uppercase px-3 py-1 border font-medium bg-red-50 text-red-700 border-red-200">
                            ✕ Người Bán Đã Từ Chối
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase px-3 py-1 border font-medium bg-amber-50 text-amber-700 border-amber-200">
                            ⏳ Đang Chờ Phản Hồi
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <span className="text-[#888888] text-[10px] uppercase block">Giá Niêm Yết</span>
                        <span className="text-[#666666] line-through">{formatPrice(offer.listing_price)}</span>
                      </div>
                      <div>
                        <span className="text-[#888888] text-[10px] uppercase block">Giá Bạn Đã Trả</span>
                        <span className="text-sm font-bold text-[#111111]">{formatPrice(offer.offered_price)}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[#888888] text-[10px] uppercase block">Bạn Tiết Kiệm</span>
                        <span className={`text-xs font-semibold ${isExpired ? 'text-[#888888] line-through' : 'text-[#1E7E34]'}`}>
                          -{formatPrice(Number(offer.listing_price) - Number(offer.offered_price))}
                        </span>
                      </div>
                    </div>

                    {offer.buyer_note && (
                      <div className="bg-[#FAF9F7] p-2.5 border border-[#EFECE6] text-xs text-[#666666] font-mono">
                        <span className="font-semibold text-[#111111]">Lời nhắn của bạn: </span>
                        "{offer.buyer_note}"
                      </div>
                    )}

                    {/* Accepted offer action trigger */}
                    {offer.status === 'accepted' && (
                      isExpired ? (
                        <div className="pt-3 border-t border-[#F0F0EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F7] p-3 border border-[#EAEAE8]">
                          <div className="text-xs font-mono text-[#777777] space-y-1">
                            <div>
                              ⚠️ <strong>Ưu đãi đã hết hạn!</strong> Mức giá ưu đãi{' '}
                              <strong className="line-through">{formatPrice(offer.offered_price)}</strong> chỉ có hiệu lực trong vòng 24 Giờ.
                            </div>
                            <div className="text-[11px] text-[#888888]">
                              Bạn có thể mua sản phẩm với giá niêm yết ban đầu hoặc gửi đề xuất giá mới.
                            </div>
                          </div>
                          <button
                            disabled
                            className="px-5 py-2.5 bg-[#E5E5E3] text-[#888888] text-xs font-mono uppercase tracking-wider whitespace-nowrap cursor-not-allowed shadow-none"
                            title="Ưu đãi đã quá 24 giờ"
                          >
                            Đã Hết Hạn Thanh Toán
                          </button>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-[#F0F0EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F8F4] p-3 border border-[#D4EDDA]">
                          <div className="text-xs font-mono text-[#155724] space-y-1">
                            <div>
                              🎉 <strong>Tuyệt vời!</strong> Người bán đã đồng ý bán cho bạn với giá ưu đãi{' '}
                              <strong>{formatPrice(offer.offered_price)}</strong>.
                            </div>
                            <div className="text-[11px] text-[#28A745] flex items-center gap-1.5">
                              <span>⏱️</span>
                              <span>
                                Ưu đãi còn hiệu lực trong <strong>{expiry?.hoursLeft} giờ {expiry?.minutesLeft} phút</strong> nữa.
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await cartServices.addToCart(offer.listing_id, 1)
                              } catch (e) {
                                // Already in cart or added
                              }
                              navigate('/cart')
                            }}
                            className="px-5 py-2.5 bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#0B0C10] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shadow-sm"
                          >
                            Thanh Toán Giá Ưu Đãi →
                          </button>
                        </div>
                      )
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Payment QR Modal */}
      <PaymentQRModal
        order={payOrder}
        onClose={() => setPayOrder(null)}
        onCancelOrder={handleCancelOrder}
        onConfirmPay={handleConfirmPay}
        cancellingId={cancellingId}
        confirmingPayment={confirmingPayment}
      />

      {/* Reusable Luxury Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => {
          if (!confirmModal.isLoading) {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }))
          }
        }}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
