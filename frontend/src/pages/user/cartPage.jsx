import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { cartServices, orderServices } from '../../services';
import { authStorage } from '../../utils/authStorage';

// Modularized components
import CartItemCard from './components/cart/CartItemCard';
import OrderSummary from './components/cart/OrderSummary';
import CheckoutForm from './components/cart/CheckoutForm';
import BankEscrowTransferGuide from './components/cart/BankEscrowTransferGuide';

// Skeleton loading state
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
);

export default function CartPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  // Payment states
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [cancellingPayment, setCancellingPayment] = useState(false);
  const [paymentPaid, setPaymentPaid] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  // Checkout form initialized safely via authStorage
  const user = authStorage.getUser() || {};
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    paymentMethod: 'BANK_TRANSFER',
  });

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await cartServices.getCart();
      const items = res.data?.data ?? res.data ?? [];
      setCartItems(items);
      setSelectedIds(items.map((i) => i.cart_item_id || i.id));
    } catch {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    try {
      await cartServices.removeCartItem(id);
      setCartItems((prev) => prev.filter((item) => (item.cart_item_id || item.id) !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch {
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const activeCheckoutItems = cartItems.filter((i) => selectedIds.includes(i.cart_item_id || i.id));

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((i) => i.cart_item_id || i.id));
    }
  };

  const handleCheckoutSingle = (item) => {
    const id = item.cart_item_id || item.id;
    setSelectedIds([id]);
    setError('');
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (activeCheckoutItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
      return;
    }
    if (!form.address.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        shipping_address: form.address.trim(),
        phone_number: form.phone.trim(),
        payment_method: form.paymentMethod,
        cartItemId: activeCheckoutItems.map((i) => i.cart_item_id || i.id),
      };
      const res = await orderServices.createOrder(payload);
      const data = res.data?.data ?? res.data ?? {};
      const id = data?.orderId ?? data?.id ?? null;
      setOrderId(id);
      setOrderResult(data);
      setOrderSuccess(true);
    } catch (err) {
      const msg =
        (typeof err === 'string' ? err : null) ||
        err?.message ||
        err?.response?.data?.message ||
        'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmBankPayment = async () => {
    if (!orderId) return;
    setConfirmingPayment(true);
    setError('');
    try {
      await orderServices.simulatePayment(orderId);
      setPaymentPaid(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Chưa thể xác thực thanh toán. Vui lòng kiểm tra lại chuyển khoản.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleCancelThisOrder = async () => {
    if (!orderId) return;
    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này không? Sản phẩm sẽ được nhả lại trên sàn.');
    if (!confirmed) return;

    setCancellingPayment(true);
    setError('');
    try {
      await orderServices.cancelOrder(orderId);
      setOrderCancelled(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể hủy đơn hàng này.');
    } finally {
      setCancellingPayment(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  // ── Render Case 1: Order Cancelled ──
  if (orderCancelled) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white border border-[#E5E5E3] p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-[#FDF2F2] border border-[#F5C6CB] text-[#D93838] flex items-center justify-center mx-auto text-xl font-bold">
              ✕
            </div>
            <h2 className="text-xl font-serif text-[#111111]">ĐƠN HÀNG ĐÃ ĐƯỢC HỦY</h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Đơn hàng #{orderId} đã được hủy bỏ thành công. Các sản phẩm đã được nhả lại sàn Aura Vault.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setOrderCancelled(false);
                  setOrderSuccess(false);
                  setStep('cart');
                  fetchCart();
                }}
                className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              >
                Quay Lại Giỏ Hàng
              </button>
              <Link
                to="/shop"
                className="w-full border border-[#E5E5E3] text-[#444444] text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#F5F5F4] transition-colors text-center"
              >
                Tiếp Tục Khám Phá
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── Render Case 2: Payment Escrow Confirmed ──
  if (paymentPaid) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white border border-[#E5E5E3] p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-[#F2F8F4] border border-[#C3E6CB] text-[#1E7E34] flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-serif text-[#111111] uppercase tracking-wide">
              ĐÃ XÁC NHẬN THANH TOÁN KÝ QUỸ!
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Đơn hàng của bạn đã được tiếp nhận. Người bán sẽ chuẩn bị gửi sản phẩm đến trung tâm kiểm định Aura Vault.
            </p>
            <div className="p-3.5 bg-[#FAF9F7] border border-[#EAEAE8] text-left text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#888888]">
                <span>Mã đơn hàng:</span>
                <span className="font-bold text-[#111111]">#{orderId}</span>
              </div>
              <div className="flex justify-between text-[#888888]">
                <span>Trạng thái:</span>
                <span className="font-semibold text-[#1E7E34]">ĐÃ KÝ QUỸ ESCROW</span>
              </div>
            </div>
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/my-orders"
                className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#2A2A2A] transition-colors text-center cursor-pointer"
              >
                Xem Đơn Hàng Của Tôi
              </Link>
              <Link
                to="/shop"
                className="w-full border border-[#E5E5E3] text-[#444444] text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#F5F5F4] transition-colors text-center"
              >
                Khám Phá Thêm
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── Render Case 3: Waiting for VietQR Transfer ──
  if (orderSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBFBFA] py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            {error && (
              <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <BankEscrowTransferGuide
              orderResult={orderResult}
              orderId={orderId}
              copiedField={copiedField}
              onCopy={copyToClipboard}
              onConfirmPaid={handleConfirmBankPayment}
              onCancelOrder={handleCancelThisOrder}
              confirmingPayment={confirmingPayment}
              cancellingPayment={cancellingPayment}
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── Render Case 4: Cart Bag View ──
  if (step === 'cart') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBFBFA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="border-b border-[#E5E5E3] pb-5 mb-8">
              <p className="text-xs font-mono uppercase tracking-widest text-[#444444] mb-1">
                Aura Vault
              </p>
              <h1 className="text-2xl sm:text-3xl font-light text-[#111111] tracking-tight">
                GIỎ HÀNG CỦA BẠN
              </h1>
            </div>

            {error && (
              <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <CartSkeleton />
            ) : cartItems.length === 0 ? (
              <div className="text-center py-24 space-y-5">
                <div className="mx-auto w-16 h-16 border border-[#E5E5E3] flex items-center justify-center text-[#CCCCCC]">
                  🛍️
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
              <div className="lg:flex lg:gap-8 items-start">
                {/* Left: Cart Items List */}
                <div className="flex-1 space-y-3 mb-8 lg:mb-0">
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

                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.cart_item_id || item.id}
                      item={item}
                      isSelected={selectedIds.includes(item.cart_item_id || item.id)}
                      onToggleSelect={toggleSelectItem}
                      onCheckoutSingle={handleCheckoutSingle}
                      onDelete={handleDelete}
                      isDeleting={deletingId === (item.cart_item_id || item.id)}
                    />
                  ))}
                </div>

                {/* Right: Summary */}
                <div className="lg:w-80 xl:w-96">
                  <OrderSummary
                    cartItems={activeCheckoutItems}
                    onProceed={() => {
                      if (activeCheckoutItems.length === 0) {
                        setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                        return;
                      }
                      setError('');
                      setStep('checkout');
                    }}
                    proceedLabel={
                      activeCheckoutItems.length === 0
                        ? 'CHỌN SẢN PHẨM ĐỂ MUA'
                        : `TIẾN HÀNH THANH TOÁN (${activeCheckoutItems.length})`
                    }
                    disabled={activeCheckoutItems.length === 0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── Render Case 5: Checkout Form Step ──
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FBFBFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="border-b border-[#E5E5E3] pb-5 mb-8">
            <button
              onClick={() => {
                setError('');
                setStep('cart');
              }}
              className="text-xs font-mono uppercase tracking-wider text-[#666666] hover:text-[#111111] transition-colors mb-3 flex items-center gap-1 cursor-pointer"
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

          {error && (
            <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="lg:flex lg:gap-8 items-start">
            {/* Left: Shipping & Payment Form */}
            <div className="flex-1 mb-8 lg:mb-0">
              <CheckoutForm
                form={form}
                setForm={setForm}
              />
            </div>

            {/* Right: Order Summary + Submit Button */}
            <div className="lg:w-80 xl:w-96">
              <OrderSummary cartItems={activeCheckoutItems} proceedLabel="">
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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
      <Footer />
    </>
  );
}
