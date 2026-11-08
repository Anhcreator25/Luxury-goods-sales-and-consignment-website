import React from 'react'

export default function SellerReputationCard({ sellerName, completedSales = 0, joinedDate }) {
  const yearJoined = joinedDate ? new Date(joinedDate).getFullYear() : '2025'

  return (
    <div className="bg-[#FAF9F7] border border-[#E8E6E1] p-5 space-y-3.5 my-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center font-serif text-sm font-bold uppercase rounded-full">
            {sellerName ? sellerName.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#111111] font-serif">
                {sellerName || 'Nhà Sưu Tầm Aura'}
              </span>
              <span className="bg-[#EAE8E3] text-[#444444] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#D5D2CA]">
                ✓ Trusted Merchant
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#777777] block mt-0.5">
              Gia nhập Aura Vault từ {yearJoined}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
        <div className="border-r border-[#EAE7E0] pr-2">
          <div className="text-base font-semibold text-[#111111]">
            {completedSales > 0 ? completedSales : '12+'}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-[#777777]">
            Đơn Đã Bán
          </div>
        </div>

        <div className="border-r border-[#EAE7E0] pr-2">
          <div className="text-base font-semibold text-[#1E7E34]">
            100%
          </div>
          <div className="text-[9px] uppercase tracking-wider text-[#777777]">
            Hàng Chính Hãng
          </div>
        </div>

        <div>
          <div className="text-base font-semibold text-[#111111]">
            &lt; 2 Giờ
          </div>
          <div className="text-[9px] uppercase tracking-wider text-[#777777]">
            Phản Hồi Offer
          </div>
        </div>
      </div>

      <div className="text-[11px] font-mono text-[#666666] bg-white/70 border border-[#EAE7E0] p-2.5 flex items-center gap-2">
        <span className="text-sm">🛡️</span>
        <span>Người bán đã xác minh danh tính KYC &amp; cam kết ký gửi độc quyền tại Aura Vault.</span>
      </div>
    </div>
  )
}
