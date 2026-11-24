import React from 'react';
import { PRICE_SHORTCUTS, POPULAR_BRANDS, CONDITIONS } from '../../constants/shopConstants';
import { formatConditionGrade } from '../../utils/formatters';

export default function ShopSidebar({
  pendingMinPrice,
  setPendingMinPrice,
  pendingMaxPrice,
  setPendingMaxPrice,
  pendingBrand,
  setPendingBrand,
  pendingConditions,
  onConditionToggle,
  onApplyFilters,
  onClearFilters,
}) {
  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0 bg-white border border-[#E5E5E3] p-6 sticky top-24 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Header sidebar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3] mb-5">
        <span className="text-xs font-mono uppercase tracking-widest text-[#111111] font-bold">
          BỘ LỌC ĐA TIÊU CHÍ
        </span>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-[11px] font-mono text-[#888888] hover:text-[#D93838] transition-colors cursor-pointer"
        >
          Xóa lọc
        </button>
      </div>

      {/* Lọc Phân khúc giá nhanh */}
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#F0F0EE] pb-2 mb-3 font-semibold">
          Phân Khúc Giá (₫)
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {PRICE_SHORTCUTS.map((sc) => {
            const isSelected = pendingMinPrice === sc.min && pendingMaxPrice === sc.max;
            return (
              <button
                key={sc.label}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setPendingMinPrice('');
                    setPendingMaxPrice('');
                  } else {
                    setPendingMinPrice(sc.min);
                    setPendingMaxPrice(sc.max);
                  }
                }}
                className={`px-2 py-1.5 text-[10px] font-mono border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#EAEAE8] bg-[#FAFAFA] text-[#666666] hover:border-[#111111] hover:text-[#111111]'
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <input
            type="number"
            placeholder="Giá từ..."
            value={pendingMinPrice}
            onChange={(e) => setPendingMinPrice(e.target.value)}
            className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#C5A880]"
          />
          <input
            type="number"
            placeholder="Giá đến..."
            value={pendingMaxPrice}
            onChange={(e) => setPendingMaxPrice(e.target.value)}
            className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#C5A880]"
          />
        </div>
      </div>

      {/* Lọc Thương hiệu */}
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#F0F0EE] pb-2 mb-3 font-semibold">
          Thương Hiệu
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {POPULAR_BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setPendingBrand(pendingBrand === b ? '' : b)}
              className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                pendingBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#FAFAFA] text-[#666666] border-[#EAEAE8] hover:border-[#111111]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Hoặc nhập tên hiệu khác…"
          value={pendingBrand}
          onChange={(e) => setPendingBrand(e.target.value)}
          className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#C5A880] placeholder:text-[#AAAAAA]"
        />
      </div>

      {/* Lọc Tình trạng */}
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#F0F0EE] pb-2 mb-3 font-semibold">
          Tình Trạng
        </p>
        <div className="space-y-2.5">
          {CONDITIONS.map((cond) => {
            const condValue = typeof cond === 'object' ? cond.value : cond;
            const condLabel = typeof cond === 'object' ? cond.label : formatConditionGrade(cond);
            return (
              <label key={condValue} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={pendingConditions.includes(condValue)}
                  onChange={() => onConditionToggle(condValue)}
                  className="accent-[#111111]"
                />
                <span className="text-xs text-[#555555] group-hover:text-[#111111] transition-colors">
                  {condLabel}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Nút Áp dụng */}
      <button
        type="button"
        onClick={onApplyFilters}
        className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-widest py-3 hover:bg-[#C5A880] hover:text-[#0B0C10] transition-colors cursor-pointer font-semibold"
      >
        Áp Dụng Bộ Lọc
      </button>
    </aside>
  );
}
