---
name: luxury-escrow-workflow
description: Hướng dẫn nghiệp vụ ký quỹ Escrow, vòng đời đơn hàng, hoa hồng sàn, giải ngân cho người bán và hệ thống trả giá Offers trên sàn Aura Vault.
---

# Aura Vault — Escrow, Orders & Offers Workflow Guidelines

Tài liệu quy chuẩn nghiệp vụ tài chính và dòng tiền cho sàn ký gửi xa xỉ **Aura Vault**.

---

## 1. Cơ Chế Ký Quỹ Escrow (Trung Gian Giữ Tiền)
Vì sản phẩm trên sàn có giá trị lớn, sàn đóng vai trò trung gian giữ tiền để bảo vệ người mua khỏi hàng giả/hàng lỗi và bảo vệ người bán nhận đủ tiền:

```
Buyer đặt hàng & thanh toán
      │
      ▼
Đơn hàng: status = 'confirmed', payment_status = 'paid'
(Sàn giữ tiền trong quỹ Escrow)
      │
      ▼
Seller giao hàng -> Buyer nhận hàng và kiểm tra
      │
      ▼
Buyer bấm: "Xác nhận đã nhận hàng" (confirm-receipt)
      │
      ▼
Hệ thống:
  1. Đổi orders.order_status = 'completed'
  2. Tạo bản ghi trong `escrow_payouts` (status = 'pending')
  3. Lấy thông tin tài khoản mặc định của Seller từ `user_bank_accounts`
      │
      ▼
Admin kiểm tra trong trang Escrow Management và bấm Giải Ngân (Disburse)
      │
      ▼
Cập nhật `escrow_payouts.status = 'completed'`, lưu `disbursed_by` và `disbursed_at`.
```

---

## 2. Công Thức Tính Tài Chính & Hoa Hồng Sàn
- `total_amount = sum(item.price * item.quantity)`
- Phí hoa hồng sàn thu từ giao dịch (`commission_fee`): Mặc định tính theo tỷ lệ sàn (ví dụ: 10% đến 15%).
- Tiền thực nhận của người bán (`seller_payout`):
  $$\text{seller\_payout} = \text{total\_amount} - \text{commission\_fee}$$
- Số tiền trong `escrow_payouts.amount` chính là `seller_payout`.

---

## 3. Nghiệp Vụ Trả Giá / Đàm Phán Giá (Offers)
Bảng `offers` cho phép người mua gửi mức giá mong muốn thấp hơn giá niêm yết:
- Trạng thái offer: `pending` (chờ seller trả lời), `accepted` (đồng ý), `rejected` (từ chối).
- Khi offer được chấp nhận (`accepted`), người mua có quyền tạo đơn hàng với giá đã chốt thay vì giá gốc của sản phẩm.
