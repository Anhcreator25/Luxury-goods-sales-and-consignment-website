---
name: backend-architecture
description: Hướng dẫn phân tầng 4 lớp (Routes, Middleware, Controller, Service) và quản lý MySQL Transaction, Schema Integrity cho backend Node.js Express. Dùng khi viết API hoặc query database.
---

# Aura Vault — Backend Architecture & Database Integrity Guidelines

Tài liệu quy chuẩn kiến trúc backend Node.js (Express) và cơ sở dữ liệu MySQL cho sàn **Aura Vault**. Mọi lập trình viên và AI Agent BẮT BUỘC tuân thủ phân tầng nghiêm ngặt sau:

---

## 1. Luồng Phân Tầng Bất Biến (Strict 4 Layers)

```
[Request]
   │
   ▼
[1. Route: backend/src/routes/*.js]
   │  -> Gắn endpoint, HTTP method, middlewares (verifyToken, verifyRole)
   ▼
[2. Middleware: backend/src/middlewares/*.js]
   │  -> Xác thực JWT, phân quyền role ('admin', 'user'), rate-limit
   ▼
[3. Controller: backend/src/controller/*.js]
   │  -> Validate input cơ bản, gọi Service, trả HTTP Response JSON chuẩn
   ▼
[4. Service: backend/src/services/*.js]
   │  -> Chứa 100% nghiệp vụ logic, tính toán, và tương tác DB Pool
   ▼
[MySQL Database Pool: backend/src/config/db.js]
```

### Các điều cấm kỵ:
- **CẤM** viết câu lệnh SQL trực tiếp trong file Controller hoặc Route.
- **CẤM** bỏ qua tầng Service. Mọi nghiệp vụ phải nằm trong Service để tái sử dụng và kiểm thử độc lập.

---

## 2. Quy Chuẩn Từng Tầng

### Tầng 1: Routes
- Chỉ khai báo đường dẫn, gắn Controller và Middleware.
- Ví dụ:
  ```javascript
  router.get('/admin/escrow', verifyToken, verifyRole(["admin"]), orderController.getAdminEscrowPayoutsController);
  ```

### Tầng 2: Controller
- Bọc toàn bộ trong khối `try/catch`.
- Chuẩn hóa cấu trúc JSON trả về:
  ```javascript
  export const getItems = async (req, res) => {
    try {
      const data = await itemService.getAll();
      return res.status(200).json({
        success: true,
        data,
        message: "Lấy dữ liệu thành công"
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Lỗi máy chủ nội bộ"
      });
    }
  };
  ```

### Tầng 3: Service & Database Query
- Luôn sử dụng parameterized query (`?`) để chống SQL Injection:
  ```javascript
  const [rows] = await pool.query('SELECT * FROM listings WHERE id = ? AND status = ?', [id, 'active']);
  ```
- **Transaction Safety:** Với các luồng có từ 2 thao tác ghi (INSERT/UPDATE/DELETE) trở lên hoặc ảnh hưởng đến tiền bạc/kho hàng, BẮT BUỘC sử dụng Transaction:
  ```javascript
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('UPDATE orders SET order_status = ? WHERE id = ?', ['completed', orderId]);
    await connection.query('INSERT INTO escrow_payouts (...) VALUES (...)', [...]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  ```

---

## 3. Quy Chuẩn Schema Cơ Sở Dữ Liệu
Chỉ sử dụng 11 bảng đã được đồng bộ trong `database/schema_and_sample_data.sql`:
1. `users` (role: `'admin'`, `'user'`)
2. `categories`
3. `brands` (có `logo_url`)
4. `listings` (condition: `'UNWORN'`, `'VERY_GOOD'`, `'GOOD'`, `'FAIR'`; status: `'pending'`, `'active'`, `'sold'`, `'rejected'`)
5. `listing_images`
6. `cart_items`
7. `orders` (cột: `commission_fee`, `seller_payout`, `order_status`, `payment_status`, `updated_at`)
8. `order_items`
9. `offers` (`listing_id`, `buyer_id`, `offered_price`, `status`)
10. `user_bank_accounts` (`bank_name`, `bank_account_number`, `bank_account_holder`, `is_default`)
11. `escrow_payouts` (`order_id`, `seller_id`, `amount`, `commission_fee`, `status`, `recipient_bank`, `recipient_account`)
