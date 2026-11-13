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
 * Chuẩn hóa nhãn tình trạng hàng hiệu theo tiêu chuẩn quốc tế Chrono24 (4 cấp độ kinh điển)
 * Hỗ trợ nhận diện cả dạng Enum (PRISTINE, LIKE_NEW...) và dạng chuỗi tiếng Anh có sẵn trong DB
 */
export const formatConditionGrade = (grade) => {
  if (!grade) return 'Đã Giám Định';
  const str = String(grade).trim();
  const upper = str.toUpperCase();

  // 1. Chưa qua sử dụng / Mới 100% (Unworn / New)
  if (upper.includes('BRAND NEW') || upper.includes('PRISTINE') || upper.includes('UNWORN') || upper.includes('100%') || upper.includes('MỚI 100%')) {
    return 'Chưa qua sử dụng (Mới 100%)';
  }
  // 2. Rất tốt / Như mới (Very Good)
  if (upper.includes('LIKE NEW') || upper.includes('99%') || upper.includes('98%') || upper.includes('NHƯ MỚI')) {
    return 'Rất tốt (Như mới)';
  }
  // 3. Tốt / Đã qua sử dụng (Good)
  if (upper.includes('EXCELLENT') || upper.includes('VERY GOOD') || upper.includes('GOOD') || upper.includes('97%') || upper.includes('95%') || upper.includes('90%') || upper.includes('XUẤT SẮC') || upper.includes('RẤT TỐT')) {
    return 'Tốt (Đã sử dụng)';
  }
  // 4. Khá / Dấu vết thời gian (Fair)
  if (upper.includes('FAIR') || upper.includes('LIGHTLY USED') || upper.includes('USED') || upper.includes('85%') || upper.includes('80%') || upper.includes('70%') || upper.includes('POOR') || upper.includes('KHÁ')) {
    return 'Khá (Dấu vết thời gian)';
  }

  return str;
};

export const CONDITION_MAP = {
  UNWORN: { label: "Chưa qua sử dụng (Mới 100%)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PRISTINE: { label: "Chưa qua sử dụng (Mới 100%)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  NEW: { label: "Chưa qua sử dụng (Mới 100%)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  VERY_GOOD: { label: "Rất tốt (Như mới)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  LIKE_NEW: { label: "Rất tốt (Như mới)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  GOOD: { label: "Tốt (Đã sử dụng)", color: "bg-amber-50 text-amber-700 border-amber-200" },
  EXCELLENT: { label: "Tốt (Đã sử dụng)", color: "bg-amber-50 text-amber-700 border-amber-200" },
  FAIR: { label: "Khá (Dấu vết thời gian)", color: "bg-gray-50 text-gray-600 border-gray-200" },
};
