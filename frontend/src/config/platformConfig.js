/**
 * Platform Global Configuration
 * Chỉnh sửa tỷ lệ hoa hồng hoặc cấu hình sàn tại đây.
 */
export const PLATFORM_CONFIG = {
  // Tỷ lệ hoa hồng sàn (0.05 = 5%)
  COMMISSION_RATE: 0.05,

  // Phần trăm hoa hồng hiển thị tự động (5)
  get commissionPercent() {
    return Math.round(this.COMMISSION_RATE * 100)
  },

  // Phần trăm thực nhận của người bán (95)
  get sellerPayoutPercent() {
    return 100 - this.commissionPercent
  },
}
