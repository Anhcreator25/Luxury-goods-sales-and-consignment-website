import React from 'react';

export default function CheckoutForm({
  form,
  setForm,
}) {
  const paymentOptions = [
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
      label: 'Thẻ tín dụng / Ghi nợ quốc tế (Visa, Mastercard, JCB)',
      desc: 'Thanh toán trực tuyến bảo mật tiêu chuẩn mã hóa quốc tế PCI-DSS',
      icon: '💳',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Shipping Address Information */}
      <div className="border border-[#E5E5E3] bg-white p-6 space-y-5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#E5E5E3] pb-3">
          Thông Tin Giao Hàng
        </h2>

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

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
            Số Điện Thoại Nhận Hàng
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
            placeholder="0901 234 567"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
            Địa Chỉ Giao Hàng Chi Tiết
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

      {/* Escrow Prepaid Payment Selection */}
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
          Quy định bảo chứng Aura Vault: Để đảm bảo giá trị nguyên bản của các sản phẩm xa xỉ và loại trừ mọi rủi ro thanh toán, sàn áp dụng 100% hình thức Ký Quỹ Escrow. Tiền được phong tỏa an toàn tuyệt đối cho đến khi quý khách nhận hàng và nghiệm thu.
        </div>

        {paymentOptions.map((opt) => (
          <div key={opt.value} className="space-y-3">
            <label
              className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${
                form.paymentMethod === opt.value ? 'border-[#111111] bg-[#FAFAFA]' : 'border-[#E5E5E3] hover:border-[#CCCCCC]'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                checked={form.paymentMethod === opt.value}
                onChange={() => setForm({ ...form, paymentMethod: opt.value })}
                className="mt-1 accent-[#111111]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{opt.icon}</span>
                  <span className="text-sm font-medium text-[#111111]">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-[#111111] text-white px-1.5 py-0.5">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#666666] mt-0.5">{opt.desc}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
