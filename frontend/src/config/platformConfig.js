/**
 * Platform Global Configuration
 * Chỉnh sửa tỷ lệ hoa hồng hoặc cấu hình sàn tại đây.
 */
export const PLATFORM_CONFIG = {
  // Tỷ lệ hoa hồng sàn (ví dụ: 0.03 = 3%, 0.05 = 5%, 0.10 = 10%)
  COMMISSION_RATE: 0.03,

  // Phần trăm hoa hồng hiển thị tự động (ví dụ: 3)
  get commissionPercent() {
    return Math.round(this.COMMISSION_RATE * 100)
  },

  // Phần trăm thực nhận của người bán (ví dụ: 97)
  get sellerPayoutPercent() {
    return 100 - this.commissionPercent
  },
}
