import React from 'react';
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
  const finalAmount = orderResult?.finalAmount || orderResult?.total || 0;
  const qrUrl = orderResult?.qrUrl;
  const bankAccount = orderResult?.bankAccount || '0822173222';
  const bankCode = orderResult?.bankCode || 'MB';
  const accountName = orderResult?.accountName || 'LUXURY PLATFORM';
  const transferContent = orderResult?.transferContent || `AV ${orderId}`;

  return (
    <div className="bg-white border border-[#E5E5E3] p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2 border-b border-[#E5E5E3] pb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-[#F2F8F4] text-[#1E7E34] px-3 py-1 border border-[#C3E6CB] inline-block font-semibold">
          🛡️ Thanh toán an toàn 100%
        </span>
        <h2 className="text-lg sm:text-xl font-serif text-[#111111] uppercase tracking-wide">
          HƯỚNG DẪN CHUYỂN KHOẢN VIETQR
        </h2>
        <p className="text-xs text-[#666666] max-w-lg mx-auto leading-relaxed">
          Vui lòng quét mã bên dưới hoặc chuyển đúng nội dung để hệ thống xác nhận tự động
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* VietQR Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#FAFAFA] border border-[#EAEAE8] rounded-none">
          {qrUrl ? (
            <img src={qrUrl} alt="VietQR Escrow Transfer" className="w-56 h-auto border border-[#E5E5E3] shadow-sm bg-white" />
          ) : (
            <div className="w-56 h-56 bg-white border border-[#E5E5E3] flex items-center justify-center text-xs font-mono text-[#888888] text-center p-4">
              Mã QR Đang Khởi Tạo...
            </div>
          )}
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mt-3">
            Quét bằng ứng dụng ngân hàng bất kỳ
          </span>
        </div>

        {/* Bank Credentials Detail */}
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block">Ngân hàng thụ hưởng</span>
            <p className="font-semibold text-[#111111] text-sm mt-0.5">{bankCode} (Ngân hàng Quân Đội MBBank)</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Số tài khoản</span>
              <button
                type="button"
                onClick={() => onCopy(bankAccount, 'account')}
                className="text-[10px] font-mono uppercase text-[#444444] hover:underline cursor-pointer"
              >
                {copiedField === 'account' ? '✓ Đã sao chép' : 'Sao chép'}
              </button>
            </div>
            <p className="font-mono text-base font-bold text-[#111111] tracking-wide mt-0.5">{bankAccount}</p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block">Chủ tài khoản</span>
            <p className="font-semibold text-[#111111] uppercase mt-0.5">{accountName}</p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block">Số tiền cần thanh toán</span>
            <p className="font-mono text-base font-bold text-[#111111] mt-0.5">{formatPrice(finalAmount)}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Nội dung chuyển khoản</span>
              <button
                type="button"
                onClick={() => onCopy(transferContent, 'content')}
                className="text-[10px] font-mono uppercase text-[#444444] hover:underline cursor-pointer"
              >
                {copiedField === 'content' ? '✓ Đã sao chép' : 'Sao chép'}
              </button>
            </div>
            <p className="font-mono text-base font-bold text-[#1E7E34] bg-[#F2F8F4] px-2.5 py-1 inline-block border border-[#C3E6CB] mt-0.5">
              {transferContent}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="border-t border-[#E5E5E3] pt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancelOrder}
          disabled={cancellingPayment}
          className="sm:w-1/3 border border-[#D93838] text-[#D93838] text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#D93838] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
        >
          {cancellingPayment ? 'Đang hủy...' : '✕ Hủy Đơn Này'}
        </button>
        <button
          type="button"
          onClick={onConfirmPaid}
          disabled={confirmingPayment}
          className="sm:w-2/3 bg-[#111111] text-white text-xs font-mono uppercase tracking-wider py-3.5 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
