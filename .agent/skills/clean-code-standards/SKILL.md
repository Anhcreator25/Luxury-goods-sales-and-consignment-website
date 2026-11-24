---
name: clean-code-standards
description: Hướng dẫn tiêu chuẩn code sạch (Clean Code), định dạng tiền tệ VND, tổ chức API service frontend và xử lý lỗi đồng bộ cho dự án Aura Vault.
---

# Aura Vault — Clean Code & Project Standards

Tài liệu quy chuẩn phong cách code, tổ chức module và các quy tắc tiện ích cho toàn dự án **Aura Vault**.

---

## 1. Định Dạng Tiền Tệ & Ngày Tháng (Formatters)
- **Tiền tệ VND:** BẮT BUỘC dùng hàm tập trung trong `frontend/src/utils/formatters.js`, tuyệt đối không tự format chuỗi thủ công:
  ```javascript
  import { formatPrice } from "../utils/formatters";
  // Kết quả: "150.000.000 ₫"
  ```
- **Độ mới hàng hiệu:** Luôn dùng `formatConditionShort(grade)` để hiển thị nhãn ngắn gọn trên card sản phẩm:
  - `UNWORN` -> `Brand New`
  - `VERY_GOOD` -> `Like New`
  - `GOOD` -> `Good`
  - `FAIR` -> `Fair`

---

## 2. Tổ Chức Gọi API Frontend (Service Layer)
- **Quy tắc:** Tất cả các cuộc gọi API bằng Axios hoặc Fetch PHẢI được viết trong `frontend/src/services/*.js`.
- Không gọi trực tiếp `axios.get(...)` hay `axios.post(...)` bên trong các file component `.jsx`.
- **Ví dụ chuẩn:**
  ```javascript
  // frontend/src/services/orderService.js
  import api from './api';

  export const confirmReceipt = async (orderId) => {
    const res = await api.put(`/orders/${orderId}/confirm-receipt`);
    return res.data;
  };
  ```

---

## 3. Phân Quyền & Bảo Vệ Tuyến Đường (Auth Guards)
- Hệ thống hỗ trợ 2 vai trò chuẩn: `'admin'` và `'user'`.
- Phía Frontend:
  - Sử dụng Protected Route kiểm tra token từ `localStorage` và `user.role`.
  - Tuyến đường `/admin/*` chỉ dành riêng cho role `'admin'`.
  - Tuyến đường `/orders`, `/my-listings`, `/bank-account` yêu cầu đăng nhập.
- Phía Backend:
  - Mọi route cần bảo vệ phải gắn middleware `verifyToken`.
  - Mọi route admin phải gắn thêm `verifyRole(['admin'])`.
