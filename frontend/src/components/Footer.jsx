import React from "react";

export default function Footer({ onCategorySelect }) {
  return (
    <footer className="w-full bg-white border-t border-[#EAEAE8] py-12 px-6 lg:px-8 text-xs text-[#666666]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-3">
          <span className="text-base font-serif font-bold text-[#111111] uppercase tracking-[0.2em]">
            Aura Vault
          </span>
          <p className="text-[11px] leading-relaxed text-[#777777]">
            Sàn giao dịch và ký gửi hàng hiệu xa xỉ bảo chứng, mang đến trải nghiệm minh bạch và đẳng cấp.
          </p>
        </div>
        <div>
          <h4 className="font-mono text-[#111111] uppercase tracking-wider text-[11px] mb-3 font-semibold">Danh mục</h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button 
                type="button"
                onClick={() => onCategorySelect && onCategorySelect(3)} 
                className="hover:text-[#111111] cursor-pointer"
              >
                Đồng hồ xa xỉ
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => onCategorySelect && onCategorySelect(1)} 
                className="hover:text-[#111111] cursor-pointer"
              >
                Túi xách cao cấp
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => onCategorySelect && onCategorySelect(5)} 
                className="hover:text-[#111111] cursor-pointer"
              >
                Trang sức & Đá quý
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => onCategorySelect && onCategorySelect(2)} 
                className="hover:text-[#111111] cursor-pointer"
              >
                Sneaker & Giày hiệu
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[#111111] uppercase tracking-wider text-[11px] mb-3 font-semibold">Cam kết</h4>
          <ul className="space-y-2 text-[11px]">
            <li>Kiểm định chính hãng 100%</li>
            <li>Giao dịch ký quỹ an toàn</li>
            <li>Bảo hiểm vận chuyển toàn quốc</li>
            <li>Đổi trả theo tiêu chuẩn giám định</li>
          </ul>
        </div>
        <div> 
          <h4 className="font-mono text-[#111111] uppercase tracking-wider text-[11px] mb-3 font-semibold">Liên hệ</h4>
          <p className="text-[11px] text-[#777777]">Tòa nhà Aura Vault, Hoàn Kiếm, Hà Nội</p>
          <p className="text-[11px] text-[#777777] mt-1">Email: contact@auravault.luxury</p>
          <p className="text-[11px] text-[#777777] mt-1">Hotline: 1900 8888 (24/7)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#F0F0EE] pt-6 flex flex-wrap justify-between items-center text-[10px] font-mono text-[#999999]">
        <div>AURA VAULT PLATFORM © {new Date().getFullYear()} • ALL RIGHTS RESERVED</div>
        <div className="space-x-6">
          <span>AUTHENTICITY GUARANTEED</span>
          <span>ESCROW SECURED</span>
        </div>
      </div>
    </footer>
  );
}

