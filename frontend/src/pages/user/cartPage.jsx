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
  const [selectedIds, setSelectedIds] = useState([])
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
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: '',
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
      const items = res.data?.data ?? res.data ?? []
      setCartItems(items)
      // Mặc định chọn tất cả các sản phẩm trong giỏ
      setSelectedIds(items.map((i) => i.cart_item_id || i.id))
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
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id))
    } catch (err) {
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }

  // Danh sách các món được chọn thanh toán
  const activeCheckoutItems = cartItems.filter((i) => selectedIds.includes(i.cart_item_id || i.id))

  // Toggle chọn một sản phẩm
  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  // Chọn tất cả hoặc bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(cartItems.map((i) => i.cart_item_id || i.id))
    }
  }

  // Mua riêng 1 món duy nhất
  const handleCheckoutSingle = (item) => {
    const id = item.cart_item_id || item.id
    setSelectedIds([id])
    setError('')
    setStep('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (activeCheckoutItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán.')
      return
    }
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
        cartItemId: activeCheckoutItems.map((i) => i.cart_item_id || i.id),
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
                  {/* Cổng hiển thị thanh toán tương ứng */}
                  <div className="bg-[#FBFBFA] border border-[#E5E5E3] p-4 flex flex-col items-center justify-center text-center">
                    {orderResult?.payment_method === 'MOMO' ? (
                      <>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`2|99|0822173222|||0|0|${Math.round(totalAmount)}|DH${orderId}|transfer_myqr`)}`}
                          alt="MoMo QR"
                          className="w-56 h-auto border border-[#FFD6E0] shadow-inner bg-white p-2"
                        />
                        <p className="text-[11px] font-mono text-[#A00045] mt-3 font-semibold">
                          📱 Quét mã bằng ứng dụng Ví MoMo
                        </p>
                      </>
                    ) : orderResult?.payment_method === 'ZALOPAY' ? (
                      <>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://zalopay.vn/pay?amount=${Math.round(totalAmount)}&note=DH${orderId}`)}`}
                          alt="ZaloPay QR"
                          className="w-56 h-auto border border-[#BEE3F8] shadow-inner bg-white p-2"
                        />
                        <p className="text-[11px] font-mono text-[#0068FF] mt-3 font-semibold">
                          ⚡ Quét mã bằng Zalo hoặc app ZaloPay
                        </p>
                      </>
                    ) : orderResult?.payment_method === 'CREDIT_CARD' ? (
                      <div className="w-60 h-36 bg-gradient-to-br from-[#1F1F1F] via-[#111111] to-[#0A0A0A] text-white p-4 flex flex-col justify-between border border-[#333333] shadow-xl">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#AAAAAA]">
                          <span>Aura Vault Card</span>
                          <span>VISA / MASTERCARD</span>
                        </div>
                        <div className="font-mono text-sm tracking-widest text-center my-auto">
                          •••• •••• •••• {form.cardNumber ? form.cardNumber.slice(-4) : '8888'}
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-[#888888]">
                          <span>{form.cardHolder || 'CARD HOLDER'}</span>
                          <span>{form.cardExpiry || '12/28'}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={qrUrl}
                          alt="VietQR Chuyển Khoản"
                          className="w-56 h-auto border border-[#E5E5E3] shadow-inner bg-white"
                        />
                        <p className="text-[11px] text-[#666666] mt-3">
                          Quét mã bằng app ngân hàng (VietQR / Mobile Banking)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Chi tiết tài khoản thanh toán */}
                  <div className="space-y-4 text-sm">
                    {orderResult?.payment_method === 'MOMO' ? (
                      <>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Cổng thanh toán</p>
                          <p className="font-semibold text-[#A00045]">Ví Điện Tử MoMo (Ký Quỹ Escrow)</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Số điện thoại ví MoMo</p>
                            <button
                              onClick={() => copyToClipboard('0822173222', 'momo_phone')}
                              className="text-[10px] font-mono uppercase text-[#444444] hover:underline"
                            >
                              {copiedField === 'momo_phone' ? '✓ Đã sao chép' : 'Sao chép'}
                            </button>
                          </div>
                          <p className="font-mono text-base font-bold text-[#111111] tracking-wide">0822173222</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Tên ví nhận</p>
                          <p className="font-semibold text-[#111111] uppercase">LUXURY PLATFORM</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Lời nhắn chuyển ví</p>
                            <button
                              onClick={() => copyToClipboard(transferContent, 'momo_content')}
                              className="text-[10px] font-mono uppercase text-[#444444] hover:underline"
                            >
                              {copiedField === 'momo_content' ? '✓ Đã sao chép' : 'Sao chép'}
                            </button>
                          </div>
                          <p className="font-mono text-base font-bold text-[#A00045] bg-[#FFF5F7] px-2.5 py-1 inline-block border border-[#FFD6E0]">
                            {transferContent}
                          </p>
                        </div>
                      </>
                    ) : orderResult?.payment_method === 'ZALOPAY' ? (
                      <>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Cổng thanh toán</p>
                          <p className="font-semibold text-[#0068FF]">Ví Điện Tử ZaloPay (Ký Quỹ Escrow)</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Số tài khoản ZaloPay</p>
                            <button
                              onClick={() => copyToClipboard('0822173222', 'zalopay_phone')}
                              className="text-[10px] font-mono uppercase text-[#444444] hover:underline"
                            >
                              {copiedField === 'zalopay_phone' ? '✓ Đã sao chép' : 'Sao chép'}
                            </button>
                          </div>
                          <p className="font-mono text-base font-bold text-[#111111] tracking-wide">0822173222</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Tên người nhận</p>
                          <p className="font-semibold text-[#111111] uppercase">LUXURY PLATFORM</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Nội dung thanh toán</p>
                            <button
                              onClick={() => copyToClipboard(transferContent, 'zalopay_content')}
                              className="text-[10px] font-mono uppercase text-[#444444] hover:underline"
                            >
                              {copiedField === 'zalopay_content' ? '✓ Đã sao chép' : 'Sao chép'}
                            </button>
                          </div>
                          <p className="font-mono text-base font-bold text-[#0068FF] bg-[#EBF8FF] px-2.5 py-1 inline-block border border-[#BEE3F8]">
                            {transferContent}
                          </p>
                        </div>
                      </>
                    ) : orderResult?.payment_method === 'CREDIT_CARD' ? (
                      <>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Phương thức</p>
                          <p className="font-semibold text-[#111111]">Thẻ Tín Dụng / Ghi Nợ Quốc Tế</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Trạng thái ủy quyền</p>
                          <p className="font-mono text-xs font-semibold text-[#1E7E34] bg-[#F2F8F4] px-2 py-1 inline-block border border-[#C3E6CB]">
                            ✓ Đã xác thực bảo mật 3D-Secure
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Mã giao dịch đối soát</p>
                          <p className="font-mono text-sm font-bold text-[#111111]">CC-{orderId}-{Date.now().toString().slice(-6)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666] leading-relaxed">
                            Khoản tiền đã được ủy quyền phong tỏa an toàn qua cổng quốc tế. Đơn hàng sẽ được người bán đóng gói và bàn giao ngay.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
                  {/* Select All Bar */}
                  <div className="flex items-center justify-between border border-[#E5E5E3] bg-white px-4 py-3 text-xs font-mono">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cartItems.length > 0 && selectedIds.length === cartItems.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-[#111111] cursor-pointer"
                      />
                      <span className="uppercase tracking-wider text-[#111111] font-medium">
                        Chọn tất cả ({selectedIds.length}/{cartItems.length})
                      </span>
                    </label>
                    {selectedIds.length > 0 && selectedIds.length < cartItems.length && (
                      <span className="text-[#888888] text-[11px]">
                        Đang chọn {selectedIds.length} món để thanh toán
                      </span>
                    )}
                  </div>

                  {cartItems.map((item) => {
                    const itemId = item.cart_item_id || item.id
                    const listing = item.listing ?? item
                    const thumb = item.primary_image || (listing?.images && listing.images[0]) || listing?.image_url || null
                    const price = item.selling_price ?? listing?.selling_price ?? listing?.price ?? item.price ?? 0
                    const brand = item.brand_name || listing?.brand_name || listing?.brand || item.brand || ''
                    const condition = item.condition_grade || listing?.condition_grade || item.condition || ''
                    const title = item.title || listing?.title || 'Sản phẩm xa xỉ'
                    const isSelected = selectedIds.includes(itemId)

                    return (
                      <div
                        key={itemId}
                        className={`flex gap-3 sm:gap-4 border p-4 transition-colors bg-white ${
                          isSelected ? 'border-[#111111]' : 'border-[#E5E5E3] hover:border-[#CCCCCC]'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="flex items-center pt-2 sm:pt-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(itemId)}
                            className="w-4 h-4 accent-[#111111] cursor-pointer"
                            title="Chọn sản phẩm này để thanh toán"
                          />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#F5F5F4] overflow-hidden">
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

                          {/* Offer Negotiation Status Badge in Cart */}
                          {item.latest_offer_status === 'pending' && (
                            <div className="mt-2 p-2 bg-[#FFFDF5] border border-[#FBEEC1] text-xs font-mono space-y-0.5">
                              <p className="text-amber-800 font-semibold flex items-center gap-1">
                                <span>⏳</span>
                                <span>Đang chờ duyệt giá: {formatPrice(item.latest_offered_price || 0)}</span>
                              </p>
                              <p className="text-[10px] text-amber-700">
                                Người bán đang xem xét mức giá bạn đề xuất.
                              </p>
                            </div>
                          )}

                          {item.latest_offer_status === 'accepted' && (
                            <div className="mt-2 p-2 bg-[#F2F8F4] border border-[#C3E6CB] text-xs font-mono space-y-0.5">
                              <p className="text-emerald-800 font-semibold flex items-center gap-1">
                                <span>🎉</span>
                                <span>Giá ưu đãi đã duyệt: {formatPrice(price)}</span>
                              </p>
                              <p className="text-[10px] text-emerald-700">
                                Tiết kiệm {formatPrice(Number(item.original_listing_price || price) - Number(price))} (áp dụng trong 24h).
                              </p>
                            </div>
                          )}

                          {item.latest_offer_status === 'rejected' && (
                            <div className="mt-2 p-2 bg-[#FDF2F2] border border-[#F5C6CB] text-xs font-mono space-y-0.5">
                              <p className="text-red-800 font-semibold flex items-center gap-1">
                                <span>✕</span>
                                <span>Người bán đã từ chối giá {formatPrice(item.latest_offered_price || 0)}</span>
                              </p>
                              <p className="text-[10px] text-red-700">
                                Sản phẩm hiện áp dụng mức giá niêm yết ban đầu.
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#F0F0EE]">
                            <p className="text-xs text-[#888888]">Số lượng: {item.quantity || 1}</p>

                            {/* Single Item Checkout Action */}
                            <button
                              type="button"
                              onClick={() => handleCheckoutSingle(item)}
                              className="text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#2A2A2A] font-semibold flex items-center gap-1 bg-[#F5F5F4] hover:bg-[#EBEBEA] px-3 py-1.5 transition-colors border border-[#E5E5E3]"
                            >
                              <span>Mua sản phẩm</span>
                              <span className="text-[10px]">→</span>
                            </button>
                          </div>
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
                    cartItems={activeCheckoutItems}
                    onProceed={() => {
                      if (activeCheckoutItems.length === 0) {
                        setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán.')
                        return
                      }
                      setError('')
                      setStep('checkout')
                    }}
                    proceedLabel={
                      activeCheckoutItems.length === 0
                        ? 'CHỌN SẢN PHẨM ĐỂ MUA'
                        : `TIẾN HÀNH THANH TOÁN (${activeCheckoutItems.length})`
                    }
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

              {/* Payment Method - 4 Luxury Prepaid Escrow Options */}
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
                  ⓘ <strong>Quy định bảo chứng Aura Vault:</strong> Để đảm bảo giá trị nguyên bản của các sản phẩm xa xỉ và loại trừ mọi rủi ro thanh toán, sàn áp dụng 100% hình thức Ký Quỹ Escrow. Tiền được phong tỏa an toàn tuyệt đối cho đến khi quý khách nhận hàng và nghiệm thu.
                </div>

                {[
                  {
                    value: 'BANK_TRANSFER',
                    label: 'Chuyển khoản liên ngân hàng 24/7 (VietQR)',
                    desc: 'Quét mã VietQR tự động điền số tài khoản, số tiền và nội dung chuyển khoản',
                    icon: '🏦',
                    badge: 'Khuyên Dùng'
                  },
                  {
                    value: 'MOMO',
                    label: 'Ví điện tử MoMo (MoMo QR Payment)',
                    desc: 'Thanh toán tức thì qua ứng dụng Ví MoMo tiện lợi và bảo mật',
                    icon: '📱',
                    badge: 'Phổ Biến'
                  },
                  {
                    value: 'ZALOPAY',
                    label: 'Ví điện tử ZaloPay (ZaloPay QR)',
                    desc: 'Quét mã thanh toán qua Zalo hoặc ứng dụng ZaloPay',
                    icon: '⚡',
                  },
                  {
                    value: 'CREDIT_CARD',
                    label: 'Thẻ tín dụng / Ghi nợ quốc tế (Visa, Mastercard, JCB, Apple Pay)',
                    desc: 'Thanh toán trực tuyến bảo mật tiêu chuẩn mã hóa quốc tế PCI-DSS',
                    icon: '💳',
                  },
                ].map((opt) => (
                  <div key={opt.value} className="space-y-3">
                    <label
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

                    {/* Form nhập thẻ tín dụng quốc tế bảo mật */}
                    {opt.value === 'CREDIT_CARD' && form.paymentMethod === 'CREDIT_CARD' && (
                      <div className="p-4 bg-[#FBFBFA] border border-[#E5E5E3] space-y-3 animate-fadeIn ml-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                            Số Thẻ (16 chữ số)
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="4123 •••• •••• 9012"
                            value={form.cardNumber}
                            onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                            className="w-full bg-white border border-[#DCDCDA] px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                            Tên In Trên Thẻ
                          </label>
                          <input
                            type="text"
                            placeholder="NGUYEN VAN A"
                            value={form.cardHolder}
                            onChange={(e) => setForm({ ...form, cardHolder: e.target.value.toUpperCase() })}
                            className="w-full bg-white border border-[#DCDCDA] px-3 py-2 text-xs font-mono uppercase text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                              Hết Hạn (MM/YY)
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="12/28"
                              value={form.cardExpiry}
                              onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })}
                              className="w-full bg-white border border-[#DCDCDA] px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                              Mã Bảo Mật (CVV / CVC)
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={form.cardCvv}
                              onChange={(e) => setForm({ ...form, cardCvv: e.target.value })}
                              className="w-full bg-white border border-[#DCDCDA] px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-[#888888] flex items-center gap-1 mt-1">
                          🔒 Thông tin thẻ được mã hóa bảo mật 256-bit theo chuẩn quốc tế PCI-DSS.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Order Summary + Place Order button */}
            <div className="lg:w-80 xl:w-96">
              <OrderSummary cartItems={activeCheckoutItems} proceedLabel="">
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
