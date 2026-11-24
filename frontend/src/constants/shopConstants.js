export const CATEGORIES = [
  { label: 'Tất Cả Sản Phẩm', id: null, desc: 'Toàn bộ các tác phẩm xa xỉ đã qua kiểm định nghiêm ngặt từ các thương hiệu hàng đầu thế giới.' },
  { label: 'Túi Xách Thượng Lưu', id: 1, desc: 'Những kiệt tác túi xách kinh điển từ Hermès Birkin, Chanel Classic Flap, Louis Vuitton, Dior.' },
  { label: 'Sneaker & Giày Hiệu', id: 2, desc: 'Bộ sưu tập giày hiếm, phiên bản giới hạn chính hãng Jordan, Dior, Nike x Travis Scott.' },
  { label: 'Đồng Hồ Xa Xỉ', id: 3, desc: 'Cỗ máy thời gian đỉnh cao của Rolex, Patek Philippe, Audemars Piguet, Cartier nguyên bản.' },
  { label: 'Thời Trang Đường Phố', id: 4, desc: 'Các thiết kế Streetwear xa xỉ, phong cách thời thượng từ Off-White, Supreme, Balenciaga.' },
  { label: 'Trang Sức & Phụ Kiện', id: 5, desc: 'Tinh hoa trang sức kim cương, vàng khối từ Cartier, Van Cleef & Arpels, Bvlgari.' },
];

export const CONDITIONS = [
  { value: 'UNWORN',    label: 'Chưa qua sử dụng (Mới 100%)', keywords: ['unworn', 'brand new', 'pristine', '100%'] },
  { value: 'VERY_GOOD', label: 'Rất tốt (Như mới)',           keywords: ['very_good', 'very good', 'like new', '99%', '98%'] },
  { value: 'GOOD',      label: 'Tốt (Đã sử dụng)',            keywords: ['good', 'excellent', '97%', '95%', '90%'] },
  { value: 'FAIR',      label: 'Khá (Dấu vết thời gian)',     keywords: ['fair', 'used', '70%', '80%', '85%'] }
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export const POPULAR_BRANDS = ['Rolex', 'Hermès', 'Chanel', 'Patek Philippe', 'Louis Vuitton', 'Cartier', 'Dior'];

export const PRICE_SHORTCUTS = [
  { label: 'Dưới 10 Triệu', min: '', max: '10000000' },
  { label: '10Tr - 50Tr', min: '10000000', max: '50000000' },
  { label: '50Tr - 200Tr', min: '50000000', max: '200000000' },
  { label: 'Trên 200 Triệu', min: '200000000', max: '' },
];
