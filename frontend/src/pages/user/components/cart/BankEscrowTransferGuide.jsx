import React, { useState } from 'react';
import { formatPrice } from '../../../../utils/formatters';

export default function BankEscrowTransferGuide({
  orderResult,
  orderId,
  copiedField,
  onCopy,
  onConfirmPaid,
  onCancelOrder,
  confirmingPayment,
  cancellingPayment,
}) {
  const [imageError, setImageError] = useState(false);

  // Platform Escrow Bank Information strictly retrieved from ENV
  const bankCode = import.meta.env.VITE_PLATFORM_BANK_CODE;
  const bankAccount = import.meta.env.VITE_PLATFORM_BANK_ACCOUNT;
  const bankName = import.meta.env.VITE_PLATFORM_BANK_NAME;
  const accountName = import.meta.env.VITE_PLATFORM_BANK_HOLDER;

  // Order payment specifics
  const finalAmount = Math.round(orderResult?.totalAmount || orderResult?.total_amount || orderResult?.total || 0);
  const transferContent = `DH${orderId}`;

  // Generate VietQR directly using ENV configuration
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="bg-white border border-[#E8E8E6] p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2.5 border-b border-[#E8E8E6] pb-8">
        <span className="text-[10px] font-mono uppercase tracking-widest bg-[#F2F8F4] text-[#1E7E34] px-3.5 py-1 border border-[#C3E6CB] inline-block font-medium">
          🛡️ Thanh toán Ký Quỹ Escrow An Toàn 100%
        </span>
        <h2 className="text-xl sm:text-2xl font-light font-sans text-[#111111] uppercase tracking-wide">
          HƯỚNG DẪN CHUYỂN KHOẢN VIETQR
        </h2>
        <p className="text-xs font-mono text-[#777777] max-w-lg mx-auto leading-relaxed">
          Vui lòng quét mã QR hoặc chuyển đúng số tiền và nội dung để hệ thống tự động xác nhận
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* VietQR Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#FAFAFA] border border-[#E8E8E6]">
          {!imageError && qrUrl ? (
            <img
              src={qrUrl}
              alt="VietQR Escrow Transfer"
              onError={() => setImageError(true)}
              className="w-56 sm:w-60 h-auto border border-[#E8E8E6] shadow-sm bg-white"
            />
          ) : (
            <div className="w-56 h-56 bg-white border border-[#E8E8E6] flex flex-col items-center justify-center text-xs font-mono text-[#888888] text-center p-6 space-y-2">
              <span className="text-2xl">📱</span>
              <p className="text-[#111111] font-medium">Chuyển khoản theo STK</p>
              <p className="text-[11px] text-[#777777]">Vui lòng sao chép STK và Nội dung chuyển khoản bên cạnh.</p>
            </div>
          )}
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mt-4">
            Quét bằng ứng dụng ngân hàng bất kỳ
          </span>
        </div>

        {/* Bank Credentials Detail */}
        <div className="space-y-4 text-xs font-sans">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
              Ngân hàng thụ hưởng
            </span>
            <p className="font-semibold text-[#111111] text-sm">{bankCode} - {bankName}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">Số tài khoản</span>
              <button
                type="button"
                onClick={() => onCopy(bankAccount, 'account')}
                className="text-[10px] font-mono uppercase tracking-wider text-[#111111] hover:underline cursor-pointer"
              >
                {copiedField === 'account' ? '✓ Đã sao chép' : 'Sao chép'}
              </button>
            </div>
            <p className="font-mono text-base font-bold text-[#111111] tracking-wider">{bankAccount}</p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
              Chủ tài khoản
            </span>
            <p className="font-semibold text-[#111111] uppercase">{accountName}</p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
              Số tiền cần thanh toán
            </span>
            <p className="font-mono text-lg font-bold text-[#111111]">{formatPrice(finalAmount)}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                Nội dung chuyển khoản
              </span>
              <button
                type="button"
                onClick={() => onCopy(transferContent, 'content')}
                className="text-[10px] font-mono uppercase tracking-wider text-[#111111] hover:underline cursor-pointer"
              >
                {copiedField === 'content' ? '✓ Đã sao chép' : 'Sao chép'}
              </button>
            </div>
            <p className="font-mono text-base font-bold text-[#1E7E34] bg-[#F2F8F4] px-3 py-1.5 inline-block border border-[#C3E6CB]">
              {transferContent}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="border-t border-[#E8E8E6] pt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancelOrder}
          disabled={cancellingPayment}
          className="sm:w-1/3 border border-[#D93838] text-[#D93838] text-xs font-mono uppercase tracking-widest py-3.5 hover:bg-[#D93838] hover:text-white transition-all duration-300 disabled:opacity-50 cursor-pointer"
        >
          {cancellingPayment ? 'Đang hủy...' : '✕ Hủy Đơn Này'}
        </button>
        <button
          type="button"
          onClick={onConfirmPaid}
          disabled={confirmingPayment}
          className="sm:w-2/3 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest py-3.5 hover:bg-black transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
    </div>
  );
}
