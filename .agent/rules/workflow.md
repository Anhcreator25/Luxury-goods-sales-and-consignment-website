# Project Rules — Aura Vault Platform

1. **Database Schema Integrity:**
   - Luôn đối chiếu với `database/schema_and_sample_data.sql`.
   - Tuyệt đối không tự ý bịa thêm tên bảng, tên cột, hoặc giá trị ENUM mới mà không có sự đồng thuận và cập nhật đồng thời vào file SQL schema.

2. **Backend Architecture Flow (Strict 4 Layers):**
   - Mọi chức năng API mới hoặc sửa đổi BẮT BUỘC tuân theo luồng phân tầng:
     `Route -> Middleware (verifyToken / verifyRole) -> Controller -> Service -> MySQL Pool`.
   - Bắt buộc tuân theo hướng dẫn chi tiết tại `.agent/skills/backend-architecture/SKILL.md`.
   - Tuyệt đối không viết câu lệnh query SQL trực tiếp trong file Controller.
   - Luôn định dạng JSON response trả về thống nhất: `{ success: boolean, data: any, message: string }`.

3. **Haute Luxury UI/UX Styling:**
   - Khi tạo hoặc sửa component / trang frontend, BẮT BUỘC tuân theo phong cách thiết kế tối giản xa xỉ tại `.agent/skills/luxury-ui-styling/SKILL.md`.
   - Giữ nguyên màu sắc tối giản (Off-white, White, Charcoal, Muted Gray), viền mỏng tinh tế, tracking chữ hoa rộng, ảnh tỉ lệ 4:5 có badge Verified và Condition.

4. **Domain & Escrow Workflow Compliance:**
   - Mọi logic liên quan đến đơn hàng, ký quỹ giải ngân và trả giá BẮT BUỘC tuân theo quy trình tại `.agent/skills/luxury-escrow-workflow/SKILL.md`.

5. **Clean Code & Formatting Standards:**
   - Bắt buộc dùng `formatPrice` từ `frontend/src/utils/formatters.js`.
   - Gom toàn bộ API calls vào `frontend/src/services/` theo quy chuẩn tại `.agent/skills/clean-code-standards/SKILL.md`.
