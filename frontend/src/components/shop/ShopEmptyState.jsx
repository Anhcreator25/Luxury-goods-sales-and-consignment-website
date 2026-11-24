import React from 'react';

export default function ShopEmptyState({ isAllProducts, currentCategoryLabel, onClearFilters, onShowAll }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-[#E5E5E3] p-8">
      <div className="w-12 h-12 border border-[#EAEAE8] bg-[#FBFBFA] flex items-center justify-center text-[#888888] font-serif text-xl mb-4">
        —
      </div>
      <p className="text-xl font-serif font-bold text-[#111111] mb-2 uppercase tracking-wide">
        Chưa có sản phẩm phù hợp
      </p>
      <p className="text-xs text-[#777777] max-w-sm leading-relaxed mb-6">
        {isAllProducts
          ? 'Không tìm thấy sản phẩm nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.'
          : `Hiện chưa có tác phẩm nào sẵn sàng trong bộ sưu tập ${currentCategoryLabel}.`}
      </p>
      {isAllProducts ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-7 py-3 hover:bg-[#C5A880] hover:text-[#0B0C10] transition-colors cursor-pointer"
        >
          Xóa Toàn Bộ Bộ Lọc
        </button>
      ) : (
        <button
          type="button"
          onClick={onShowAll}
          className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-7 py-3 hover:bg-[#C5A880] hover:text-[#0B0C10] transition-colors cursor-pointer"
        >
          Khám Phá Toàn Bộ Sàn
        </button>
      )}
    </div>
  );
}
