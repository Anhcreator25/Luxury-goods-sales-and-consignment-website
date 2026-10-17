/**
 * Định dạng số tiền sang chuẩn tiền tệ Việt Nam (VND)
 * @param {number|string} price 
 * @returns {string} ví dụ: "850.000.000 ₫"
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return "0 ₫";
  return Number(price).toLocaleString("vi-VN") + " ₫";
};

/**
 * Định dạng ngày tháng theo chuẩn Việt Nam
 * @param {string|Date} date 
 * @returns {string} ví dụ: "17/10/2026"
 */
export const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch {
    return String(date);
  }
};

/**
 * Chuẩn hóa nhãn tình trạng hàng hiệu
 */
export const CONDITION_MAP = {
  PRISTINE: { label: "Hoàn Hảo (Pristine)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  LIKE_NEW: { label: "Như Mới (Like New)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  EXCELLENT: { label: "Xuất Sắc (Excellent)", color: "bg-amber-50 text-amber-700 border-amber-200" },
  GOOD: { label: "Tốt (Good)", color: "bg-gray-50 text-gray-600 border-gray-200" },
};
