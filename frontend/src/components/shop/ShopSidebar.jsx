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
    <aside className="w-full lg:w-[270px] flex-shrink-0 bg-white rounded-xl border border-[#D4D4D0] p-5 sticky top-24 shadow-[0_2px_12px_rgba(17,17,17,0.04)]">
      {/* Header sidebar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E2] mb-4">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#111111] font-bold">
          Bộ Lọc Sản Phẩm
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
      <div className="mb-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#444444] pb-2 mb-2.5 border-b border-[#F0F0EE] font-semibold">
          Phân Khúc Giá (₫)
        </p>
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
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
                className={`px-2 py-1.5 text-[10px] font-mono rounded-md border transition-all cursor-pointer ${
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

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Giá từ..."
            value={pendingMinPrice}
            onChange={(e) => setPendingMinPrice(e.target.value)}
            className="w-full rounded-md border border-[#E5E5E3] bg-[#FAFAFA] px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
          />
          <input
            type="number"
            placeholder="Giá đến..."
            value={pendingMaxPrice}
            onChange={(e) => setPendingMaxPrice(e.target.value)}
            className="w-full rounded-md border border-[#E5E5E3] bg-[#FAFAFA] px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Lọc Thương hiệu */}
      <div className="mb-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#444444] pb-2 mb-2.5 border-b border-[#F0F0EE] font-semibold">
          Thương Hiệu
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {POPULAR_BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setPendingBrand(pendingBrand === b ? '' : b)}
              className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded-md border transition-colors cursor-pointer ${
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
          className="w-full rounded-md border border-[#E5E5E3] bg-[#FAFAFA] px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] placeholder:text-[#AAAAAA]"
        />
      </div>

      {/* Lọc Tình trạng */}
      <div className="mb-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#444444] pb-2 mb-2 border-b border-[#F0F0EE] font-semibold">
          Tình Trạng
        </p>
        <div className="space-y-1">
          {CONDITIONS.map((cond) => {
            const condValue = typeof cond === 'object' ? cond.value : cond;
            const condLabel = typeof cond === 'object' ? cond.label : formatConditionGrade(cond);
            return (
              <label
                key={condValue}
                className="flex items-center gap-2.5 cursor-pointer group rounded-md px-1.5 py-1 hover:bg-[#F7F7F6] transition-colors"
              >
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
        className="w-full rounded-lg bg-[#111111] text-white text-[11px] font-mono uppercase tracking-[0.18em] py-2.5 hover:bg-[#2A2A2A] transition-colors cursor-pointer font-semibold"
      >
        Áp Dụng Bộ Lọc
      </button>
    </aside>
  );
}
