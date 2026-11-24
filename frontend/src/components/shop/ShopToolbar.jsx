import React from 'react';
import { SORT_OPTIONS } from '../../constants/shopConstants';

export default function ShopToolbar({
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
  totalResults,
  loading,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between bg-white border border-[#E5E5E3] p-3.5">
      <div className="relative w-full sm:max-w-md">
        <input
          type="text"
          placeholder="Tìm kiếm tác phẩm xa xỉ..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3.5 py-2 pl-9 text-xs text-[#111111] focus:outline-none focus:border-[#C5A880] placeholder:text-[#AAAAAA]"
        />
        <svg
          className="w-3.5 h-3.5 absolute left-3 top-3 text-[#888888]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {!loading && (
          <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
            {totalResults} sản phẩm
          </span>
        )}
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs font-mono uppercase text-[#111111] focus:outline-none focus:border-[#C5A880] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
