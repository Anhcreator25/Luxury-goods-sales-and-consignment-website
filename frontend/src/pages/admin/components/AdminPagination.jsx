import React from 'react'

/**
 * Reusable Editorial Pagination Component for Admin Tables
 */
export default function AdminPagination({
  page,
  totalPages,
  total,
  itemLabel = 'mục',
  loading = false,
  onPageChange
}) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <div className="px-6 py-4 border-t border-[#E5E5E3] flex items-center justify-between">
      <span className="text-xs font-mono text-[#888888]">
        Trang {page} / {totalPages} ({total} {itemLabel})
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-[#E5E5E3] text-[#444444] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FBFBFA] transition-colors"
        >
          Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
          if (
            p === 1 || 
            p === totalPages || 
            (p >= page - 1 && p <= page + 1)
          ) {
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 text-xs font-mono transition-colors border ${
                  page === p
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-[#555555] border-[#E5E5E3] hover:border-[#111111]'
                }`}
              >
                {p}
              </button>
            )
          }
          if (p === page - 2 || p === page + 2) {
            return <span key={p} className="text-xs text-[#888888] px-1 font-mono">…</span>
          }
          return null
        })}

        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-[#E5E5E3] text-[#444444] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FBFBFA] transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  )
}
