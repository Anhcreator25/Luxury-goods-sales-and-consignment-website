import React from "react";

export default function Footer({ onCategorySelect }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0D0D0D] text-[#E0E0DE] border-t border-[#1F1F1F] pt-16 pb-12 px-6 lg:px-12 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-[#222222]">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div>
              <span className="text-lg font-serif font-bold text-white uppercase tracking-[0.25em] block">
                Aura Vault
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#888888] block mt-1">
                Haute Luxury Consignment
              </span>
            </div>
            <p className="text-xs text-[#999999] leading-relaxed font-light pr-4">
              Nền tảng giao dịch và ký gửi hàng hiệu xa xỉ bảo chứng độc lập. Mỗi món bảo vật đều trải qua quy trình thẩm định đa tầng nghiêm ngặt trước khi lưu hành.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase">
              <span>●</span>
              <span>100% Escrow Secured Vault</span>
            </div>
          </div>

          {/* Column 2: 5 Curated Categories */}
          <div>
            <h4 className="font-mono text-white uppercase tracking-[0.2em] text-xs mb-4 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
              Danh Mục Tuyển Chọn
            </h4>
            <ul className="space-y-2.5 text-xs font-light text-[#AAAAAA]">
              {[
                { label: "Đồng Hồ Xa Xỉ", id: 3 },
                { label: "Túi Xách Thượng Lưu", id: 1 },
                { label: "Sneaker & Giày Hiệu", id: 2 },
                { label: "Thời Trang Đường Phố", id: 4 },
                { label: "Trang Sức & Phụ Kiện", id: 5 },
              ].map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                    className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="text-[#555555]">›</span>
                    <span>{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Trust & Guarantees */}
          <div>
            <h4 className="font-mono text-white uppercase tracking-[0.2em] text-xs mb-4 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
              Cam Kết Bảo Chứng
            </h4>
            <ul className="space-y-2.5 text-xs font-light text-[#AAAAAA]">
              <li className="flex items-start gap-2">
                <span className="text-white/60">✓</span>
                <span>Kiểm định chính hãng độc lập 100%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/60">✓</span>
                <span>Thanh toán ký quỹ Escrow an toàn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/60">✓</span>
                <span>Bảo hiểm vận chuyển chuyên biệt toàn quốc</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/60">✓</span>
                <span>Đổi trả minh bạch theo biên bản giám định</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Private Concierge & Location */}
          <div className="space-y-3">
            <h4 className="font-mono text-white uppercase tracking-[0.2em] text-xs mb-4 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
              Dịch Vụ Khách Hàng
            </h4>
            <div className="text-xs text-[#AAAAAA] space-y-2 font-light">
              <p className="flex items-start gap-2">
                <span className="text-[#777777] font-mono">Đ/c:</span>
                <span>Tòa nhà Aura Vault, Quận Hoàn Kiếm, Hà Nội</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#777777] font-mono">Mail:</span>
                <span className="hover:text-white transition-colors">concierge@auravault.luxury</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#777777] font-mono">Hotline:</span>
                <span className="font-mono text-white tracking-wider">1900 8888 (24/7 VIP)</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1C1C1C] text-[10px] font-mono text-[#777777]">
              Giờ đón tiếp: 09:00 — 21:00 (Thứ 2 — Chủ Nhật)
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Security Standards */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-[#777777]">
          <div>
            AURA VAULT PLATFORM © {currentYear} • ALL RIGHTS RESERVED
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[#888888]">
            <span className="hover:text-[#CCCCCC] transition-colors cursor-pointer">CHÍNH SÁCH BẢO MẬT</span>
            <span>•</span>
            <span className="hover:text-[#CCCCCC] transition-colors cursor-pointer">QUY TRÌNH THẨM ĐỊNH</span>
            <span>•</span>
            <span className="hover:text-[#CCCCCC] transition-colors cursor-pointer">ĐIỀU KHOẢN KÝ QUỸ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
