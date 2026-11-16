/**
 * Centralized Luxury Constants (Single Source of Truth)
 * Sàn giao dịch xa xỉ Aura Vault
 */

export const LUXURY_CATEGORIES = [
  { 
    id: 1, 
    label: 'Túi Xách Thượng Lưu', 
    labelEn: 'Luxury Handbags', 
    slug: 'handbags', 
    tag: 'Hermès / Chanel',
    desc: 'Những kiệt tác túi xách kinh điển từ Hermès Birkin, Chanel Classic Flap, Louis Vuitton, Dior.' 
  },
  { 
    id: 2, 
    label: 'Sneaker & Giày Hiệu', 
    labelEn: 'Designer Footwear', 
    slug: 'footwear', 
    tag: 'Jordan / Dior',
    desc: 'Bộ sưu tập giày hiếm, phiên bản giới hạn chính hãng Jordan, Dior, Nike x Travis Scott.' 
  },
  { 
    id: 3, 
    label: 'Đồng Hồ Xa Xỉ', 
    labelEn: 'Luxury Watches', 
    slug: 'watches', 
    tag: 'Rolex / AP',
    desc: 'Cỗ máy thời gian đỉnh cao của Rolex, Patek Philippe, Audemars Piguet, Cartier nguyên bản.' 
  },
  { 
    id: 4, 
    label: 'Thời Trang Cao Cấp', 
    labelEn: 'High Fashion', 
    slug: 'apparel', 
    tag: 'LV / Balenciaga',
    desc: 'Các thiết kế Streetwear xa xỉ, phong cách thời thượng từ Off-White, Supreme, Balenciaga.' 
  },
  { 
    id: 5, 
    label: 'Trang Sức & Phụ Kiện', 
    labelEn: 'Fine Jewelry', 
    slug: 'jewelry', 
    tag: 'Cartier / VCA',
    desc: 'Tinh hoa trang sức kim cương, vàng khối từ Cartier, Van Cleef & Arpels, Bvlgari.' 
  },
];

export const LUXURY_BRANDS = [
  { id: 4, label: 'Gucci' },
  { id: 1, label: 'Chanel' },
  { id: 2, label: 'Hermès' },
  { id: 3, label: 'Louis Vuitton' },
  { id: 5, label: 'Dior' },
  { id: 6, label: 'Nike' },
  { id: null, label: 'Khác / Thương hiệu ngoài' },
];

export const CHRONO24_CONDITIONS = [
  { value: 'UNWORN',    label: 'Chưa qua sử dụng (Mới 100%)', labelEn: 'Unworn (Brand New)', keywords: ['unworn', 'brand new', 'pristine', '100%'] },
  { value: 'VERY_GOOD', label: 'Rất tốt (Như mới)',           labelEn: 'Very Good (Like New)', keywords: ['very_good', 'very good', 'like new', '99%', '98%'] },
  { value: 'GOOD',      label: 'Tốt (Đã sử dụng)',            labelEn: 'Good Condition',       keywords: ['good', 'excellent', '97%', '95%', '90%'] },
  { value: 'FAIR',      label: 'Khá (Dấu vết thời gian)',     labelEn: 'Fair Condition',       keywords: ['fair', 'used', '70%', '80%', '85%'] }
];
