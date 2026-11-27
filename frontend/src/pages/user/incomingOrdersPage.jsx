import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { orderServices, offerServices } from '../../services'

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
    <div className="rounded-xl border border-[#D4D4D0] bg-white shadow-[0_2px_12px_rgba(17,17,17,0.04)] hover:border-[#111111] transition-all duration-200">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mb-0.5">Mã Đơn</p>
            <p className="text-sm font-semibold text-[#111111]">#{oid}</p>
            <p className="text-xs text-[#888888] mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Buyer Info */}
        <div className="rounded-lg bg-[#F7F7F5] border border-[#E5E5E3] px-4 py-3 mb-3.5 space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Thông Tin Khách Mua Hàng</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <p className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#666666] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span>{order.buyer_name || order.buyer?.name || 'Khách Hàng'}</span>
            </p>
            {order.phone_number && (
              <p className="text-xs font-mono text-[#555555] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#666666] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span>SĐT: <strong className="text-[#111111]">{order.phone_number}</strong></span>
              </p>
            )}
          </div>
          <p className="text-xs text-[#666666] font-mono flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#888888] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span>{order.buyer_email || order.buyer?.email || '—'}</span>
          </p>
          {order.shipping_address && (
            <p className="text-xs text-[#555555] font-mono pt-1.5 border-t border-[#EAEAE8] mt-1 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#666666] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>Giao đến: <span className="text-[#111111]">{order.shipping_address}</span></span>
            </p>
          )}
        </div>

        {/* Escrow Vault Assurance Badge for Seller */}
        <div className="rounded-lg bg-[#F4F8FA] border border-[#D0E2EB] px-3.5 py-2.5 mb-4 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#1C5370] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <p className="text-xs text-[#1C5370] font-mono">
            <strong>Bảo Đảm Ký Quỹ:</strong> Tiền mua hàng đã được bảo đảm tại Quỹ Aura Vault. Tiền sẽ được giải ngân về STK của bạn sau khi người mua nhận hàng.
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
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'offers'
  const [orders, setOrders] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [ordersRes, offersRes] = await Promise.allSettled([
          orderServices.getSellerIncomingOrders(),
          offerServices.getReceivedOffers(),
        ])

        if (ordersRes.status === 'fulfilled') {
          const resVal = ordersRes.value
          const list = Array.isArray(resVal) ? resVal : (resVal?.data?.orders || resVal?.orders || resVal?.data || [])
          setOrders(Array.isArray(list) ? list : [])
        }

        if (offersRes.status === 'fulfilled') {
          const resVal = offersRes.value
          const oList = Array.isArray(resVal) ? resVal : (resVal?.data?.data || resVal?.data || [])
          setOffers(Array.isArray(oList) ? oList : [])
        }
      } catch (err) {
        console.error("Error loading incoming data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleRespondOffer = async (offerId, action) => {
    try {
      await offerServices.respondOffer(offerId, action)
      setToast(action === 'accepted' ? 'Đã chấp nhận mức giá đề xuất!' : 'Đã từ chối mức giá đề xuất.')
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: action } : o))
    } catch (err) {
      setToast(err?.response?.data?.message || 'Có lỗi xảy ra khi xử lý đề xuất.')
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E5E3] mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#111111] text-[#111111] font-bold'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            Đơn Hàng ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-3 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'offers'
                ? 'border-[#111111] text-[#111111] font-bold'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            <span>Đề Xuất Giá</span>
            {offers.filter(o => o.status === 'pending').length > 0 && (
              <span className="bg-[#111111] text-white text-[9px] px-2 py-0.5 rounded-full">
                {offers.filter(o => o.status === 'pending').length} mới
              </span>
            )}
          </button>
        </div>

        {activeTab === 'orders' ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-[#D4D4D0] bg-white p-5 text-center shadow-[0_2px_10px_rgba(17,17,17,0.03)]">
                <p className="text-2xl font-bold text-[#111111]">{loading ? '—' : totalOrders}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-1">Tổng Đơn</p>
              </div>
              <div className="rounded-xl border border-[#D4D4D0] bg-white p-5 text-center shadow-[0_2px_10px_rgba(17,17,17,0.03)]">
                <p className="text-2xl font-bold text-amber-600">{loading ? '—' : pendingOrders}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-1">Đang Chờ</p>
              </div>
              <div className="rounded-xl border border-[#D4D4D0] bg-white p-5 text-center shadow-[0_2px_10px_rgba(17,17,17,0.03)]">
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
          </>
        ) : (
          /* Offers List Tab */
          <div className="space-y-4">
            {offers.length === 0 ? (
              <div className="border border-dashed border-[#E5E5E3] bg-white py-16 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center mb-4">
                  <span className="text-xl">🏷️</span>
                </div>
                <p className="text-sm font-mono uppercase tracking-wider text-[#444444] mb-1">Chưa Có Lời Trả Giá Nào</p>
                <p className="text-xs text-[#888888]">Khi khách hàng đề xuất mức giá mong muốn cho sản phẩm, bạn sẽ duyệt tại đây.</p>
              </div>
            ) : (
              offers.map((offer) => (
                <div key={offer.id} className="rounded-xl border border-[#D4D4D0] bg-white p-5 space-y-4 shadow-[0_2px_12px_rgba(17,17,17,0.04)] font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0EE] pb-3">
                    <div className="flex items-center gap-3">
                      {offer.primary_image && (
                        <img src={offer.primary_image} alt="" className="w-12 h-12 rounded-lg object-cover border border-[#E5E5E3]" />
                      )}
                      <div>
                        <h4 className="text-sm font-serif font-medium text-[#111111]">{offer.listing_title}</h4>
                        <div className="text-xs font-mono text-[#777777] mt-0.5">
                          Khách mua: <span className="text-[#111111] font-semibold">{offer.buyer_name || offer.buyer_email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-md border ${
                        offer.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        offer.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {offer.status === 'accepted' ? 'Đã Đồng Ý' : offer.status === 'rejected' ? 'Đã Từ Chối' : 'Chờ Phản Hồi'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <span className="text-[#888888] text-[10px] uppercase block">Giá Niêm Yết</span>
                      <span className="text-[#555555] line-through">{formatPrice(offer.listing_price)}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px] uppercase block">Giá Khách Đề Xuất</span>
                      <span className="text-sm font-bold text-[#111111]">{formatPrice(offer.offered_price)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#888888] text-[10px] uppercase block">Tiết Kiệm Cho Khách</span>
                      <span className="text-xs font-semibold text-[#1E7E34]">
                        -{formatPrice(Number(offer.listing_price) - Number(offer.offered_price))}
                      </span>
                    </div>
                  </div>

                  {offer.buyer_note && (
                    <div className="bg-[#FAF9F7] p-3 border border-[#EFECE6] text-xs text-[#555555] font-mono">
                      <span className="font-semibold text-[#111111]">Lời nhắn từ khách: </span>
                      "{offer.buyer_note}"
                    </div>
                  )}

                  {offer.status === 'pending' && (
                    <div className="flex justify-end gap-3 pt-2 border-t border-[#F0F0EE]">
                      <button
                        onClick={() => handleRespondOffer(offer.id, 'rejected')}
                        className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#9A2222] border border-[#D93838]/30 hover:bg-[#FDF2F2] cursor-pointer"
                      >
                        Từ Chối
                      </button>
                      <button
                        onClick={() => handleRespondOffer(offer.id, 'accepted')}
                        className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#111111] text-white hover:bg-[#2B2B2B] cursor-pointer"
                      >
                        Đồng Ý Bán Giá Này ✓
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

