import React from 'react'

/**
 * Luxury / Minimalist Custom Confirmation Modal
 * Replaces default window.confirm with a refined UI consistent with the platform theme.
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác Nhận',
  cancelLabel = 'Đóng / Quay Lại',
  variant = 'primary', // 'danger' | 'primary' | 'success'
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null

  // Styling based on action severity
  const variantStyles = {
    danger: {
      btn: 'bg-[#B02A37] hover:bg-[#8F1F2B] text-white',
      badge: 'bg-red-50 text-red-700 border-red-200',
      icon: '⚠️',
    },
    success: {
      btn: 'bg-[#155724] hover:bg-[#0F401B] text-white',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: '✓',
    },
    primary: {
      btn: 'bg-[#111111] hover:bg-[#2A2A2A] text-white',
      badge: 'bg-gray-100 text-[#111111] border-gray-300',
      icon: 'ℹ️',
    },
  }[variant] || {
    btn: 'bg-[#111111] hover:bg-[#2A2A2A] text-white',
    badge: 'bg-gray-100 text-[#111111] border-gray-300',
    icon: 'ℹ️',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
      onClick={!isLoading ? onClose : undefined}
    >
      <div
        className="bg-[#FBFBFA] w-full max-w-md p-6 space-y-5 relative border border-[#E5E5E3] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 border font-mono uppercase tracking-wider ${variantStyles.badge}`}>
              {variantStyles.icon} {variant === 'danger' ? 'Cảnh Báo' : 'Xác Nhận'}
            </span>
            <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wide">
              {title}
            </h3>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-[#111111] text-lg leading-none transition-colors p-1"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Message Content */}
        <div className="text-xs text-[#555555] leading-relaxed whitespace-pre-line font-sans">
          {message}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-[#F0F0EE]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 border border-[#CCCCCC] bg-white text-[#444444] hover:bg-[#F0F0EE] text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 ${variantStyles.btn}`}
          >
            {isLoading && (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
