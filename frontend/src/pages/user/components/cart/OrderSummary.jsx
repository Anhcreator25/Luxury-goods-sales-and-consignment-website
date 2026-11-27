import React from 'react';
import { formatPrice } from '../../../../utils/formatters';

export default function OrderSummary({
  cartItems,
  onProceed,
  proceedLabel,
  disabled = false,
  children,
}) {
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.selling_price ?? item.listing?.selling_price ?? item.listing?.price ?? item.price ?? 0;
    return sum + Number(price) * (item.quantity || 1);
  }, 0);
  const commission = 0;
  const total = subtotal + commission;

  return (
    <div className="rounded-xl border border-[#D4D4D0] bg-white p-6 space-y-5 self-start sticky top-24 shadow-[0_2px_12px_rgba(17,17,17,0.04)]">
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
          disabled={disabled}
          className="w-full rounded-lg bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {proceedLabel}
        </button>
      )}

      {children}
    </div>
  );
}
