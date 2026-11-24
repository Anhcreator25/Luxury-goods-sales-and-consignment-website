---
name: luxury-ui-styling
description: Hướng dẫn quy chuẩn giao diện người dùng, bảng màu Haute Luxury, Typography editorial và layout card sản phẩm cho sàn Aura Vault. Dùng khi viết component hoặc giao diện trang mới.
---

# Aura Vault — Haute Luxury UI & Styling Guidelines

Tài liệu quy chuẩn phong cách giao diện dành cho sàn ký gửi thời trang & phụ kiện xa xỉ **Aura Vault**. Mọi component và layout React frontend BẮT BUỘC tuân thủ các nguyên tắc sau:

---

## 1. Triết Lý Thiết Kế (Design Philosophy)
- Phong cách: **Editorial Minimalist Luxury** (lấy cảm hứng từ Hermès, Chanel, Rolex, Farfetch, SSENSE).
- Tinh thần: Tối giản, tinh tế, sang trọng, tương phản cao, nhiều khoảng thở (generous whitespace). Tuyệt đối tránh phong cách màu sắc sặc sỡ hoặc các khối bo tròn lớn kiểu thương mại điện tử bình dân.

---

## 2. Bảng Màu Chuẩn (Color Palette)
- **Background:**
  - Nền trang chính: Off-white ấm `#F9F9F8` hoặc `#FAFAFA`.
  - Khung thẻ/Container: White `#FFFFFF`.
- **Borders & Dividers:**
  - Viền mỏng 1px: `#E8E8E6`, `#EAEAE8`, hoặc `#F0F0EE`.
  - Trạng thái hover/active: Chuyển sang viền đen `#111111` với transition mượt mà (`transition-all duration-300`).
- **Typography & Text:**
  - Tiêu đề & Brand name: Đen tuyền `#111111`.
  - Văn bản phụ, mô tả: Charcoal `#333333`, Muted Gray `#666666` hoặc `#888888`.
- **Accents:**
  - Kim loại/Champagne: Vàng kim nhạt, be hoặc monochrome (trắng/đen/xám kim loại).

---

## 3. Typography & Micro-copy
- **Tracking chữ hoa:** Tất cả các nhãn (labels), tên danh mục, tên thương hiệu, breadcrumb viết hoa đều cần giãn khoảng cách ký tự:
  - Class Tailwind: `tracking-[0.15em]` hoặc `tracking-[0.2em]`.
  - Kích thước nhỏ: `text-[10px]` hoặc `text-[11px] font-mono uppercase`.
- **Tiêu đề:** Sang trọng, thanh thoát (`font-serif` hoặc `font-sans font-light tracking-wide`).

---

## 4. Quy Chuẩn Khung Ảnh & Card Sản Phẩm (ProductCard)
1. **Tỉ lệ khung hình (Aspect Ratio):** Luôn dùng `aspect-[4/5]` cho ảnh sản phẩm thời trang/túi xách/giày để tôn dáng sản phẩm.
2. **Hiệu ứng ảnh:**
   - Background khung ảnh: `#F9F9F8`.
   - Hover zoom: `group-hover:scale-105 transition-transform duration-700 ease-out`.
   - **Fallback bắt buộc:** Luôn có `onError` để thay thế bằng ảnh fallback chất lượng cao khi link ảnh bị lỗi:
     ```jsx
     onError={(e) => {
       e.target.src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";
     }}
     ```
3. **Badges xác thực & Tình trạng:**
   - Badge xác thực (góc trên phải): `✓ Verified` với nền Frosted Glass `bg-white/90 backdrop-blur-md border border-[#EAEAE8] text-[9px] font-mono tracking-widest px-2 py-0.5`.
   - Badge tình trạng (góc dưới trái): Đọc từ hàm `formatConditionShort(grade)` (`UNWORN`, `VERY_GOOD`, `GOOD`, `FAIR`).

---

## 5. Giá Tiền & CTA Buttons
- **Giá bán:** Luôn format qua hàm `formatPrice(price)` (ví dụ: `150.000.000 ₫`).
- **Nút bấm (Buttons):**
  - Primary Button: Nền đen chữ trắng `bg-[#111111] text-white hover:bg-black font-medium tracking-wider uppercase text-xs px-6 py-3 transition-colors`.
  - Secondary / Make Offer: Nền trắng viền đen `border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white`.
