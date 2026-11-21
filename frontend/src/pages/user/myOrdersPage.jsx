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
    <div className="border border-[#E8E8E6] bg-white p-7 sm:p-8 animate-pulse">
      <div className="flex justify-between mb-6">
        <div className="h-4 bg-[#F0F0EE] w-36" />
        <div className="h-6 bg-[#F0F0EE] w-24" />
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-3 bg-[#F0F0EE] w-full" />
        <div className="h-3 bg-[#F0F0EE] w-3/4" />
      </div>
      <div className="flex justify-end">
        <div className="h-6 bg-[#F0F0EE] w-32" />
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Page Header */}
        <div className="mb-10">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-2">Tài Khoản Của Bạn</p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] uppercase font-sans">Đơn Hàng Của Tôi</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-[#FDF2F2] border-l-2 border-[#D93838] px-5 py-4">
            <p className="text-xs font-mono text-[#9A2222]">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-8 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-5 py-4">
            <p className="text-xs font-mono text-[#155724]">{successMsg}</p>
          </div>
        )}

        {/* Section Switcher: Purchase Orders vs Sent Offers */}
        <div className="flex border-b border-[#E8E8E6] mb-8">
          <button
            onClick={() => setActiveSection('orders')}
            className={`py-3.5 px-6 text-xs font-mono uppercase tracking-widest border-b-2 transition-all duration-300 cursor-pointer ${
              activeSection === 'orders'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            Đơn Mua Của Tôi ({orders.length})
          </button>
          <button
            onClick={() => setActiveSection('offers')}
            className={`py-3.5 px-6 text-xs font-mono uppercase tracking-widest border-b-2 transition-all duration-300 cursor-pointer flex items-center gap-2.5 ${
              activeSection === 'offers'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <span>Đề Xuất Giá Đã Gửi</span>
            {sentOffers.length > 0 && (
              <span className="bg-[#111111] text-white text-[9px] font-mono px-2 py-0.5 rounded-full">
                {sentOffers.length}
              </span>
            )}
          </button>
        </div>

        {activeSection === 'orders' ? (
          <>
            {/* Filter Tabs */}
            <div className="flex border-b border-[#E8E8E6] mb-8 overflow-x-auto">
              {TABS.map(tab => {
                const count = tab.key === 'all'
                  ? orders.length
                  : orders.filter(o => o.status === tab.key || o.order_status === tab.key).length

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 px-5 py-3.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors duration-200 cursor-pointer ${
                      activeTab === tab.key
                        ? 'border-[#111111] text-[#111111] font-semibold'
                        : 'border-transparent text-[#888888] hover:text-[#111111]'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-[10px]">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* Orders List Content */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-[#E8E8E6] bg-white py-20 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-[#F9F9F8] border border-[#E8E8E6] flex items-center justify-center mb-5">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-sm font-mono uppercase tracking-widest text-[#111111] mb-2 font-medium">Chưa Có Đơn Hàng Nào</p>
                <p className="text-xs text-[#888888] mb-8">Bắt đầu mua sắm ngay để trải nghiệm dịch vụ ký quỹ Aura Vault.</p>
                <Link
                  to="/shop"
                  className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-8 py-3.5 hover:bg-black transition-colors duration-300"
                >
                  Khám Phá Cửa Hàng
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
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
          <div className="space-y-6">
            {sentOffers.length === 0 ? (
              <div className="border border-[#E8E8E6] bg-white py-20 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-[#F9F9F8] border border-[#E8E8E6] flex items-center justify-center mb-5">
                  <span className="text-2xl">🏷️</span>
                </div>
                <p className="text-sm font-mono uppercase tracking-widest text-[#111111] mb-2 font-medium">Bạn Chưa Đề Xuất Giá Món Đồ Nào</p>
                <p className="text-xs text-[#888888] mb-8">Khi xem sản phẩm xa xỉ, bạn có thể gửi đề xuất giá để thương lượng với người bán.</p>
                <Link
                  to="/shop"
                  className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-8 py-3.5 hover:bg-black transition-colors duration-300"
                >
                  Xem Sản Phẩm Ngay
                </Link>
              </div>
            ) : (
              sentOffers.map((offer) => {
                const expiry = offer.status === 'accepted' ? checkOfferExpiry(offer.created_at) : null;
                const isExpired = expiry?.isExpired;

                return (
                  <div key={offer.id} className="border border-[#E8E8E6] bg-white p-6 sm:p-8 space-y-5 hover:border-[#111111] transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E8E6] pb-5">
                      <div className="flex items-center gap-4">
                        {offer.primary_image && (
                          <img src={offer.primary_image} alt="" className="w-16 h-16 object-cover border border-[#E8E8E6]" />
                        )}
                        <div>
                          <h4 className="text-sm font-serif font-medium text-[#111111]">{offer.listing_title}</h4>
                          <div className="text-xs font-mono text-[#888888] mt-1">
                            Người bán: <span className="text-[#111111] font-medium">{offer.seller_name || 'Nhà Sưu Tầm Aura'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {offer.status === 'accepted' ? (
                          isExpired ? (
                            <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border font-medium bg-[#F5F5F4] text-[#777777] border-[#E0E0DE]">
                              ✕ Ưu Đãi Đã Hết Hạn
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border font-medium bg-emerald-50 text-emerald-800 border-emerald-200">
                              ✓ Người Bán Đã Đồng Ý
                            </span>
                          )
                        ) : offer.status === 'rejected' ? (
                          <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border font-medium bg-red-50 text-red-800 border-red-200">
                            ✕ Người Bán Đã Từ Chối
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border font-medium bg-amber-50 text-amber-800 border-amber-200">
                            ⏳ Đang Chờ Phản Hồi
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs py-1">
                      <div>
                        <span className="text-[#888888] text-[10px] uppercase tracking-widest block mb-1">Giá Niêm Yết</span>
                        <span className="text-[#777777] line-through">{formatPrice(offer.listing_price)}</span>
                      </div>
                      <div>
                        <span className="text-[#888888] text-[10px] uppercase tracking-widest block mb-1">Giá Bạn Đã Trả</span>
                        <span className="text-base font-bold text-[#111111]">{formatPrice(offer.offered_price)}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[#888888] text-[10px] uppercase tracking-widest block mb-1">Bạn Tiết Kiệm</span>
                        <span className={`text-sm font-semibold ${isExpired ? 'text-[#888888] line-through' : 'text-[#1E7E34]'}`}>
                          -{formatPrice(Number(offer.listing_price) - Number(offer.offered_price))}
                        </span>
                      </div>
                    </div>

                    {offer.buyer_note && (
                      <div className="bg-[#F9F9F8] p-3.5 border border-[#E8E8E6] text-xs text-[#555555] font-mono">
                        <span className="font-semibold text-[#111111]">Lời nhắn của bạn: </span>
                        "{offer.buyer_note}"
                      </div>
                    )}

                    {/* Accepted offer action trigger */}
                    {offer.status === 'accepted' && (
                      isExpired ? (
                        <div className="pt-4 border-t border-[#E8E8E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9F9F8] p-4 border border-[#E8E8E6]">
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
                            className="px-5 py-2.5 bg-[#E8E8E6] text-[#888888] text-xs font-mono uppercase tracking-widest whitespace-nowrap cursor-not-allowed shadow-none"
                            title="Ưu đãi đã quá 24 giờ"
                          >
                            Đã Hết Hạn Thanh Toán
                          </button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-[#E8E8E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F2F8F4] p-4 border border-[#D4EDDA]">
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
                            className="px-6 py-3 bg-[#111111] text-white hover:bg-black text-xs font-mono uppercase tracking-widest transition-all duration-300 whitespace-nowrap cursor-pointer shadow-sm"
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
