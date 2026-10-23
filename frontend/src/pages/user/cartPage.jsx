import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { cartServices, orderServices } from '../../services'
import { formatPrice } from '../../utils/formatters'

// Skeleton placeholder while cart items are loading
const CartSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((n) => (
      <div key={n} className="flex gap-4 border border-[#E5E5E3] p-4 animate-pulse">
        <div className="w-24 h-24 bg-[#E5E5E3] flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 bg-[#E5E5E3] rounded w-1/3" />
          <div className="h-4 bg-[#E5E5E3] rounded w-2/3" />
          <div className="h-3 bg-[#E5E5E3] rounded w-1/4" />
          <div className="h-4 bg-[#E5E5E3] rounded w-1/5" />
        </div>
      </div>
    ))}
  </div>
)

// Condition badge labels translation
const conditionLabel = (cond) => {
  const map = {
    new: 'Mới',
    like_new: 'Như Mới',
    good: 'Tốt',
    fair: 'Khá',
    poor: 'Cũ',
  }
  return map[cond] || cond
}

// ─── Order Summary Sidebar ───────────────────────────────────────────────────
const OrderSummary = ({ cartItems, onProceed, proceedLabel, children }) => {
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.selling_price ?? item.listing?.selling_price ?? item.listing?.price ?? item.price ?? 0
    return sum + (Number(price) * (item.quantity || 1))
  }, 0)
  const commission = 0
  const total = subtotal + commission

  return (
    <div className="border border-[#E5E5E3] bg-white p-6 space-y-5 self-start sticky top-24">
      <h2 className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#E5E5E3] pb-3">
        Tóm Tắt Đơn Hàng
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-[#666666]">
          <span>Tạm tính ({cartItems.length} sản phẩm)</span>
          <span className="font-mono text-[#111111]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[#666666]">
          <span>Phí giao hàng bảo hiểm</span>
          <span className="text-[#155724] font-medium text-xs font-mono">MIỄN PHÍ</span>
        </div>
        <div className="border-t border-[#E5E5E3] pt-3 flex justify-between items-baseline">
          <span className="text-sm font-bold text-[#111111]">TỔNG CỘNG</span>
          <span className="text-xl font-bold text-[#111111] font-mono">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {proceedLabel && onProceed && (
        <button
          onClick={onProceed}
          className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#2A2A2A] transition-colors"
        >
          {proceedLabel}
        </button>
      )}

      {children}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState('cart') // 'cart' | 'checkout'
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [orderResult, setOrderResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [cancellingPayment, setCancellingPayment] = useState(false)
  const [paymentPaid, setPaymentPaid] = useState(false)
  const [orderCancelled, setOrderCancelled] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  // Checkout form state: Luxury model strictly uses prepaid bank transfer
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : {}
  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    address: '',
    paymentMethod: 'BANK_TRANSFER',
  })

  // ── Fetch cart ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await cartServices.getCart()
      setCartItems(res.data?.data ?? res.data ?? [])
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete item ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id)
    setError('')
    try {
      await cartServices.removeCartItem(id)
      setCartItems((prev) => prev.filter((item) => (item.cart_item_id || item.id) !== id))
    } catch (err) {
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Submit order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!form.address.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng.')
      return
    }
    if (!form.phone.trim()) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload = {
        shipping_address: form.address.trim(),
        phone_number: form.phone.trim(),
        payment_method: form.paymentMethod,
        cartItemId: cartItems.map((i) => i.cart_item_id || i.id),
      }
      const res = await orderServices.createOrder(payload)
      const data = res.data?.data ?? res.data ?? {}
      const id = data?.orderId ?? data?.id ?? null
      setOrderId(id)
      setOrderResult(data)
      setOrderSuccess(true)
    } catch (err) {
      const msg =
        (typeof err === 'string' ? err : null) ||
        err?.message ||
        err?.response?.data?.message ||
        'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Handle Confirm Bank Payment ─────────────────────────────────────────────
  const handleConfirmBankPayment = async () => {
    if (!orderId) return
    setConfirmingPayment(true)
    setError('')
    try {
      await orderServices.simulatePayment(orderId)
      setPaymentPaid(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Chưa thể xác thực thanh toán. Vui lòng kiểm tra lại chuyển khoản.')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const handleCancelThisOrder = async () => {
    if (!orderId) return
    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này không? Sản phẩm sẽ được nhả lại trên sàn.')
    if (!confirmed) return

    setCancellingPayment(true)
    setError('')
    try {
      await orderServices.cancelOrder(orderId)
      setOrderCancelled(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể hủy đơn hàng này.')
    } finally {
      setCancellingPayment(false)
    }
  }

  const copyToClipboard = (text, fieldName) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(''), 2500)
  }

  // ── Success State / Payment QR Screen ───────────────────────────────────────
  if (orderSuccess) {
    const envBankCode = import.meta.env.VITE_PLATFORM_BANK_CODE 
    const envBankAccount = import.meta.env.VITE_PLATFORM_BANK_ACCOUNT 
    const envBankName = import.meta.env.VITE_PLATFORM_BANK_NAME 
    const envAccountName = import.meta.env.VITE_PLATFORM_BANK_HOLDER 

    const totalAmount = orderResult?.totalAmount || orderResult?.bank_info?.amount || 0
    const bankAccount = orderResult?.bank_info?.account_number || envBankAccount
    const bankCode = orderResult?.bank_info?.bank_code || envBankCode
    const bankName = orderResult?.bank_info?.bank_name || orderResult?.bank_info?.bank_code || envBankName
    const accountName = orderResult?.bank_info?.account_name || envAccountName
    const transferContent = orderResult?.bank_info?.transfer_content || `DH${orderId}`
    const qrUrl = orderResult?.qr_url || `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${Math.round(totalAmount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header Status */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 bg-[#F2F8F4] border border-[#1E7E34] flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-[#1E7E34]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#444444]">
                Đơn Hàng #{orderId} Đã Tạo
              </p>
              <h1 className="text-2xl sm:text-3xl font-light text-[#111111] tracking-tight">
                {paymentPaid ? 'Thanh Toán Đã Được Xác Nhận' : 'Thanh Toán Để Hoàn Tất Đơn Hàng'}
              </h1>
              <p className="text-sm text-[#666666] max-w-lg mx-auto">
                {paymentPaid
                  ? 'Cảm ơn quý khách! Đơn hàng đã được xác nhận thanh toán thành công và người bán sẽ tiến hành đóng gói giao hàng.'
                  : 'Để đảm bảo tính xác thực và an toàn cho giao dịch hàng hiệu, quý khách vui lòng thanh toán chuyển khoản trước khi đơn hàng được gửi đi.'}
              </p>
            </div>

            {/* Error banner if payment confirmation fails */}
            {error && (
              <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {orderCancelled ? (
              /* Order Cancelled State */
              <div className="border border-[#E5E5E3] bg-white p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#FDF2F2] mx-auto flex items-center justify-center rounded-full border border-[#D93838]">
                  <span className="text-2xl text-[#D93838]">✕</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111] uppercase tracking-wide">
                    Đơn Hàng Đã Được Hủy
                  </h2>
                  <p className="text-sm text-[#666666] mt-1">
                    Sản phẩm trong đơn hàng đã được hoàn trả lại sàn giao dịch.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link
                    to="/my-orders"
                    className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-6 py-3 hover:bg-[#2A2A2A] transition-colors"
                  >
                    Xem Danh Sách Đơn Hàng
                  </Link>
                  <Link
                    to="/shop"
                    className="border border-[#111111] text-[#111111] text-xs font-mono uppercase tracking-wider px-6 py-3 hover:bg-[#111111] hover:text-white transition-colors"
                  >
                    Tiếp Tục Mua Sắm
                  </Link>
                </div>
              </div>
            ) : paymentPaid ? (
              /* Payment Confirmed State */
              <div className="border border-[#1E7E34] bg-white p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#F2F8F4] mx-auto flex items-center justify-center rounded-full border border-[#1E7E34]">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111] uppercase tracking-wide">
                    Thanh Toán Trả Trước Thành Công!
                  </h2>
                  <p className="text-sm text-[#666666] mt-1">
                    Trạng thái đơn: <span className="font-semibold text-[#1E7E34]">Đã Thanh Toán (Paid)</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link
                    to="/my-orders"
                    className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-6 py-3 hover:bg-[#2A2A2A] transition-colors"
                  >
                    Xem Đơn Hàng Của Tôi
                  </Link>
                  <Link
                    to="/shop"
                    className="border border-[#111111] text-[#111111] text-xs font-mono uppercase tracking-wider px-6 py-3 hover:bg-[#111111] hover:text-white transition-colors"
                  >
                    Tiếp Tục Mua Sắm
                  </Link>
                </div>
              </div>
            ) : (
              /* QR Code & Banking Instruction Box */
              <div className="border border-[#E5E5E3] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="border-b border-[#E5E5E3] pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#888888]">Số tiền cần thanh toán</span>
                    <p className="text-2xl font-bold font-mono text-[#111111] mt-0.5">
                      {formatPrice(totalAmount)}
                    </p>
                  </div>
                  <span className="bg-[#FFF8E6] text-[#856404] text-[10px] font-mono uppercase px-2.5 py-1 border border-[#FFE8A1]">
                    Chờ chuyển khoản
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 items-center">
                  {/* QR Code */}
                  <div className="bg-[#FBFBFA] border border-[#E5E5E3] p-4 flex flex-col items-center justify-center text-center">
                    <img
                      src={qrUrl}
                      alt="VietQR Chuyển Khoản"
                      className="w-56 h-auto border border-[#E5E5E3] shadow-inner bg-white"
                    />
                    <p className="text-[11px] text-[#666666] mt-3">
                      Quét mã bằng app ngân hàng (VietQR / Mobile Banking)
                    </p>
                  </div>

                  {/* Account Details */}
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Ngân hàng</p>
                      <p className="font-semibold text-[#111111]">{bankName}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Số tài khoản</p>
                        <button
                          onClick={() => copyToClipboard(bankAccount, 'account')}
                          className="text-[10px] font-mono uppercase text-[#444444] hover:underline"
                        >
                          {copiedField === 'account' ? '✓ Đã sao chép' : 'Sao chép'}
                        </button>
                      </div>
                      <p className="font-mono text-base font-bold text-[#111111] tracking-wide">{bankAccount}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Chủ tài khoản</p>
                      <p className="font-semibold text-[#111111] uppercase">{accountName}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Nội dung chuyển khoản</p>
                        <button
                          onClick={() => copyToClipboard(transferContent, 'content')}
                          className="text-[10px] font-mono uppercase text-[#444444] hover:underline"
                        >
                          {copiedField === 'content' ? '✓ Đã sao chép' : 'Sao chép'}
                        </button>
                      </div>
                      <p className="font-mono text-base font-bold text-[#1E7E34] bg-[#F2F8F4] px-2.5 py-1 inline-block border border-[#C3E6CB]">
                        {transferContent}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm Payment Action Button */}
                <div className="border-t border-[#E5E5E3] pt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleCancelThisOrder}
                      disabled={cancellingPayment}
                      className="sm:w-1/3 border border-[#D93838] text-[#D93838] text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#D93838] hover:text-white transition-colors disabled:opacity-50"
                    >
                      {cancellingPayment ? 'Đang hủy...' : '✕ Hủy Đơn Này'}
                    </button>
                    <button
                      onClick={handleConfirmBankPayment}
                      disabled={confirmingPayment}
                      className="sm:w-2/3 bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {confirmingPayment ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Đang xác thực thanh toán...
                        </>
                      ) : (
                        '✓ Tôi Đã Chuyển Khoản'
                      )}
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <Link to="/my-orders" className="text-[#666666] hover:text-[#111111] underline">
                      Xem danh sách đơn hàng
                    </Link>
                    <span className="text-[#888888]">Hệ thống bảo vệ giao dịch Aura Vault</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── Cart Step ──────────────────────────────────────────────────────────────
  if (step === 'cart') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBFBFA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="border-b border-[#E5E5E3] pb-5 mb-8">
              <p className="text-xs font-mono uppercase tracking-widest text-[#444444] mb-1">
                Aura Vault
              </p>
              <h1 className="text-2xl sm:text-3xl font-light text-[#111111] tracking-tight">
                GIỎ HÀNG CỦA BẠN
              </h1>
              {!loading && (
                <p className="text-sm text-[#666666] mt-1">
                  {cartItems.length} sản phẩm
                </p>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="lg:flex lg:gap-8">
                <div className="flex-1">
                  <CartSkeleton />
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              /* Empty State */
              <div className="text-center py-24 space-y-5">
                <div className="mx-auto w-16 h-16 border border-[#E5E5E3] flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[#CCCCCC]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="square"
                      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                    />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <p className="text-[#444444] font-light">Giỏ hàng của bạn đang trống.</p>
                <Link
                  to="/shop"
                  className="inline-block bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-8 py-3 hover:bg-[#2A2A2A] transition-colors"
                >
                  Khám Phá Sản Phẩm
                </Link>
              </div>
            ) : (
              /* Two-column layout */
              <div className="lg:flex lg:gap-8 items-start">
                {/* LEFT — Cart Items */}
                <div className="flex-1 space-y-3 mb-8 lg:mb-0">
                  {cartItems.map((item) => {
                    const itemId = item.cart_item_id || item.id
                    const listing = item.listing ?? item
                    const thumb = item.primary_image || (listing?.images && listing.images[0]) || listing?.image_url || null
                    const price = item.selling_price ?? listing?.selling_price ?? listing?.price ?? item.price ?? 0
                    const brand = item.brand_name || listing?.brand_name || listing?.brand || item.brand || ''
                    const condition = item.condition_grade || listing?.condition_grade || item.condition || ''
                    const title = item.title || listing?.title || 'Sản phẩm xa xỉ'

                    return (
                      <div
                        key={itemId}
                        className="flex gap-4 border border-[#E5E5E3] bg-white p-4 hover:border-[#CCCCCC] transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-24 h-24 flex-shrink-0 bg-[#F5F5F4] overflow-hidden">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-[#CCCCCC]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1}
                                viewBox="0 0 24 24"
                              >
                                <rect x="3" y="3" width="18" height="18" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {brand && (
                            <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-0.5">
                              {brand}
                            </p>
                          )}
                          <p className="text-sm font-medium text-[#111111] line-clamp-2 leading-snug">
                            {title}
                          </p>
                          {condition && (
                            <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider border border-[#E5E5E3] px-2 py-0.5 text-[#666666]">
                              {conditionLabel(condition)}
                            </span>
                          )}
                          <p className="mt-2 text-sm font-mono text-[#111111]">
                            {formatPrice(price)}
                          </p>
                          <p className="text-xs text-[#888888] mt-0.5">Số lượng: {item.quantity || 1}</p>
                        </div>

                        {/* Delete */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleDelete(itemId)}
                            disabled={deletingId === itemId}
                            aria-label="Xóa sản phẩm"
                            className="w-8 h-8 flex items-center justify-center border border-[#E5E5E3] text-[#666666] hover:border-[#D93838] hover:text-[#D93838] transition-colors disabled:opacity-40"
                          >
                            {deletingId === item.id ? (
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            ) : (
                              <span className="text-xs font-bold leading-none">✕</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* RIGHT — Order Summary */}
                <div className="lg:w-80 xl:w-96">
                  <OrderSummary
                    cartItems={cartItems}
                    onProceed={() => {
                      setError('')
                      setStep('checkout')
                    }}
                    proceedLabel="TIẾN HÀNH THANH TOÁN"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── Checkout Step ──────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FBFBFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="border-b border-[#E5E5E3] pb-5 mb-8">
            <button
              onClick={() => {
                setError('')
                setStep('cart')
              }}
              className="text-xs font-mono uppercase tracking-wider text-[#666666] hover:text-[#111111] transition-colors mb-3 flex items-center gap-1"
            >
              ← Quay lại giỏ hàng
            </button>
            <p className="text-xs font-mono uppercase tracking-widest text-[#444444] mb-1">
              Aura Vault
            </p>
            <h1 className="text-2xl sm:text-3xl font-light text-[#111111] tracking-tight">
              THÔNG TIN THANH TOÁN
            </h1>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="lg:flex lg:gap-8 items-start">
            {/* LEFT — Checkout Form */}
            <div className="flex-1 mb-8 lg:mb-0 space-y-6">
              {/* Personal info */}
              <div className="border border-[#E5E5E3] bg-white p-6 space-y-5">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#E5E5E3] pb-3">
                  Thông Tin Giao Hàng
                </h2>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Họ và Tên Người Nhận
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
                    placeholder="0901 234 567"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Địa Chỉ Giao Hàng
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors resize-none"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>

              {/* Payment Method - COD REMOVED */}
              <div className="border border-[#E5E5E3] bg-white p-6 space-y-4">
                <div className="border-b border-[#E5E5E3] pb-3 flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#444444]">
                    Phương Thức Thanh Toán Trả Trước
                  </h2>
                  <span className="text-[10px] font-mono text-[#1E7E34] uppercase bg-[#F2F8F4] px-2 py-0.5 border border-[#C3E6CB]">
                    Thanh toán an toàn 100%
                  </span>
                </div>

                <div className="bg-[#FFF8E6] border border-[#FFE8A1] p-3.5 text-xs text-[#856404] leading-relaxed">
                  ⓘ <strong>Quy định bảo chứng:</strong> Đối với sản phẩm xa xỉ cao cấp, quý khách vui lòng thanh toán trước 100% qua Chuyển khoản ngân hàng (VietQR). Hệ thống giữ tiền bảo chứng cho đến khi quý khách nhận và nghiệm thu sản phẩm.
                </div>

                {[
                  {
                    value: 'BANK_TRANSFER',
                    label: 'Chuyển khoản ngân hàng 24/7 (VietQR)',
                    desc: 'Quét mã QR tự động điền số tài khoản, số tiền và nội dung chuyển khoản',
                    icon: '🏦',
                    badge: 'Khuyên Dùng'
                  },
                  {
                    value: 'CREDIT_CARD',
                    label: 'Thẻ tín dụng / Ghi nợ quốc tế',
                    desc: 'Visa, Mastercard, JCB (Chuyển khoản theo quy trình ký quỹ)',
                    icon: '💳',
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${
                      form.paymentMethod === opt.value
                        ? 'border-[#111111] bg-[#FAFAFA]'
                        : 'border-[#E5E5E3] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={(e) =>
                        setForm({ ...form, paymentMethod: e.target.value })
                      }
                      className="mt-0.5 accent-[#111111]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span className="text-sm font-medium text-[#111111]">
                            {opt.label}
                          </span>
                        </div>
                        {opt.badge && (
                          <span className="text-[10px] font-mono uppercase bg-[#111111] text-white px-2 py-0.5">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#888888] mt-1">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* RIGHT — Order Summary + Place Order button */}
            <div className="lg:w-80 xl:w-96">
              <OrderSummary cartItems={cartItems} proceedLabel="">
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Đang xử lý đơn...
                    </>
                  ) : (
                    'TIẾN HÀNH THANH TOÁN'
                  )}
                </button>

                <p className="text-[10px] font-mono text-[#888888] text-center mt-3 leading-relaxed">
                  Bằng cách đặt hàng, bạn đồng ý với{' '}
                  <Link to="/terms" className="underline hover:text-[#444444]">
                    Điều khoản bảo chứng dịch vụ
                  </Link>{' '}
                  của Aura Vault.
                </p>
              </OrderSummary>
            </div>
          </div>
        </div>
      </div>
      {/* Global Footer */}
      <Footer />
    </>
  )
}
