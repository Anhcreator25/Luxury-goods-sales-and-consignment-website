-- ==============================================================================
-- AURA VAULT — HAUTE LUXURY CONSIGNMENT PLATFORM
-- DATABASE SCHEMA & SAMPLE DATA (FULL SEED)
-- Target Database: luxury_platform_db (MySQL 8.0+)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `luxury_platform_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `luxury_platform_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table structure for table `users`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table structure for table `categories`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table structure for table `brands`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table structure for table `listings`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `listings`;
CREATE TABLE `listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `brand_id` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `condition_grade` VARCHAR(100) DEFAULT 'Brand New (100% - Fullbox)',
  `original_price` DECIMAL(15,2) DEFAULT NULL,
  `selling_price` DECIMAL(15,2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'active', 'sold', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table structure for table `listing_images`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `listing_images`;
CREATE TABLE `listing_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `image_url` TEXT NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table structure for table `cart_items`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `listing_id` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table structure for table `orders`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyer_id` INT NOT NULL,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `commission_Fee` DECIMAL(15,2) DEFAULT 0.00,
  `seller_Payout` DECIMAL(15,2) DEFAULT 0.00,
  `shipping_address` TEXT NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'BANK_TRANSFER',
  `order_status` ENUM('pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table structure for table `order_items`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `listing_id` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  `price` DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- SAMPLE DATA (SEED DATA)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Insert Users (Password: 123456 - Hash Bcrypt 10 rounds: $2a$10$w09u7uR3bA1w8s9oK7Uu1u9N1C2G9U7V.8I6Y8R3H5X1W2Q9Z0.Om)
-- Note: Mật khẩu mặc định cho cả 2 tài khoản là "123456"
-- ------------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Aura Vault Concierge', 'admin@auravault.luxury', '$2a$10$0z8q5wE4q4uS0Y3C8fV8E.O9eA8G0v9C7T6Y3b8o9U0X8Z1V3Q5B2', '19008888', 'admin'),
(2, 'Hoàng Trọng Chung', 'client@auravault.luxury', '$2a$10$0z8q5wE4q4uS0Y3C8fV8E.O9eA8G0v9C7T6Y3b8o9U0X8Z1V3Q5B2', '0912345678', 'buyer');

-- ------------------------------------------------------------------------------
-- 2. Insert 5 Core Categories
-- ------------------------------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Túi Xách Thượng Lưu', 'tui-xach-thuong-luu', 'Những kiệt tác túi xách kinh điển từ Hermès Birkin, Chanel Classic Flap, Louis Vuitton, Dior.'),
(2, 'Sneaker & Giày Hiệu', 'sneaker-giay-hieu', 'Bộ sưu tập giày hiếm, phiên bản giới hạn chính hãng Jordan, Dior, Nike x Travis Scott.'),
(3, 'Đồng Hồ Xa Xỉ', 'dong-ho-xa-xi', 'Cỗ máy thời gian đỉnh cao của Rolex, Patek Philippe, Audemars Piguet, Hublot nguyên bản.'),
(4, 'Thời Trang Đường Phố', 'thoi-trang-duong-pho', 'Các thiết kế Streetwear xa xỉ, phong cách thời thượng từ Off-White, Supreme, Balenciaga.'),
(5, 'Trang Sức & Phụ Kiện', 'trang-suc-phu-kien', 'Tinh hoa trang sức kim cương, vàng khối từ Cartier, Van Cleef & Arpels, Bvlgari.');

-- ------------------------------------------------------------------------------
-- 3. Insert Brands
-- ------------------------------------------------------------------------------
INSERT INTO `brands` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Chanel', 'chanel', 'Thương hiệu thời trang & túi xách haute couture biểu tượng nước Pháp.'),
(2, 'Hermès', 'hermes', 'Đỉnh cao đồ da thủ công và nghệ thuật chế tác xa xỉ toàn cầu.'),
(3, 'Louis Vuitton', 'louis-vuitton', 'Nhà mốt vali, đồ da và phong cách lữ hành thượng lưu.'),
(4, 'Gucci', 'gucci', 'Di sản thời trang xa xỉ phong cách Ý đương đại.'),
(5, 'Dior', 'dior', 'Đỉnh cao phong cách thanh lịch và thời trang Haute Couture Paris.'),
(6, 'Nike', 'nike', 'Các dòng giày thể thao phiên bản giới hạn và collab xa xỉ.'),
(7, 'Rolex', 'rolex', 'Cỗ máy thời gian huyền thoại biểu tượng cho địa vị và độ chuẩn xác.'),
(8, 'Hublot', 'hublot', 'Nghệ thuật hợp nhất cơ khí đương đại và vật liệu quý.'),
(9, 'Patek Philippe', 'patek-philippe', 'Đỉnh cao Haute Horlogerie Thụy Sĩ độc bản.'),
(10, 'Cartier', 'cartier', 'Vua của các nhà kim hoàn, trang sức & đồng hồ quý tộc.');

-- ------------------------------------------------------------------------------
-- 4. Insert Listings (Sample Luxury Products)
-- ------------------------------------------------------------------------------
INSERT INTO `listings` (`id`, `seller_id`, `category_id`, `brand_id`, `title`, `condition_grade`, `original_price`, `selling_price`, `description`, `status`) VALUES
(1, 1, 1, 2, 'Vali Hermès R.M.S Cabin Suitcase Phối Da & Vải Canvas', 'Brand New (100% - Fullbox)', 170000000.00, 150000000.00, 'Kiệt tác vali du lịch cao cấp từ Hermès. Tình trạng hoàn hảo nguyên hộp fullbox từ store Paris, đầy đủ hóa đơn bảo hành và thẻ chip NFC xác thực.', 'active'),
(2, 1, 4, 6, 'Áo Khoác Nam Nike Sportswear Air Puffer Mens Winter Jacket HM0198-011 Màu Đen Size M', 'Brand New (100% - Fullbox)', 3800000.00, 3200000.00, 'Áo phao lông vũ Nike Air cao cấp, giữ ấm tối đa trong mùa đông với phom dáng Streetwear thể thao thanh lịch.', 'active'),
(3, 1, 2, 6, 'Giày Thể Thao Nam Nike Killshot 2 Ltr Prm Nam HQ1657-004 Màu Be Size 8.5', 'Good (90%)', 3700000.00, 3590000.00, 'Mẫu sneaker cổ điển thanh lịch, phối màu be thanh nhã cực kỳ tôn chân, phụ kiện đi kèm nguyên hộp.', 'active'),
(4, 1, 3, 8, 'Đồng Hồ Nữ Hublot Big Bang One Click Gold Diamond Pave 33 485.OX.1180.RX.1604', 'Brand New (100% - Fullbox)', 185000000.00, 175000000.00, 'Vàng hồng King Gold 18K đính full kim cương thiên nhiên tinh xảo. Bộ máy cơ khí tự động Swiss Made, thẻ bảo hành điện tử chính hãng Hublot.', 'active'),
(5, 1, 3, 7, 'Đồng Hồ Rolex GMT-Master II 126710BLRO Pepsi Oyster', 'Brand New (100% - Fullbox)', 520000000.00, 485000000.00, 'Biểu tượng cỗ máy thời gian vành gốm Cerachrom xanh đỏ Pepsi. Tình trạng mới nguyên seal, hộp sổ thẻ bảo hành quốc tế Rolex 2026.', 'active'),
(6, 1, 1, 1, 'Túi Xách Chanel Classic Flap Medium Caviar Da Bê Đen Khóa Vàng', 'Like New (99%)', 280000000.00, 245000000.00, 'Chiếc túi mơ ước của mọi quý cô, da bê sần Caviar bền bỉ với thời gian, bảo quản chuyên nghiệp trong tủ độ ẩm tiêu chuẩn.', 'active'),
(7, 1, 2, 5, 'Dép Sục Nam Dior Indior Mule Black Grey Màu Đen Xám Size 41', 'Brand New (100% - Fullbox)', 17100000.00, 15900000.00, 'Dép sục Dior họa tiết Oblique biểu tượng, chất liệu cao cấp mềm mại đem lại cảm giác êm ái thượng lưu.', 'active'),
(8, 1, 5, 10, 'Vòng Tay Cartier Love Bracelet 4 Diamonds Vàng Vàng 18K', 'Brand New (100% - Fullbox)', 290000000.00, 268000000.00, 'Tuyệt tác tình yêu vĩnh cửu từ Cartier, đính 4 viên kim cương brilliant-cut rực rỡ, kèm tuốc nơ vít và chứng thư chính hãng.', 'active');

-- ------------------------------------------------------------------------------
-- 5. Insert Listing Images
-- ------------------------------------------------------------------------------
INSERT INTO `listing_images` (`listing_id`, `image_url`, `is_primary`) VALUES
(1, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 1),
(2, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80', 1),
(3, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', 1),
(4, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', 1),
(5, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', 1),
(6, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 1),
(7, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80', 1),
(8, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', 1);

-- ------------------------------------------------------------------------------
-- 6. Insert Sample Orders
-- ------------------------------------------------------------------------------
INSERT INTO `orders` (`id`, `buyer_id`, `total_amount`, `commission_Fee`, `seller_Payout`, `shipping_address`, `phone`, `payment_method`, `order_status`, `payment_status`) VALUES
(20, 2, 7650000.00, 1147500.00, 6502500.00, 'Tòa nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh', '0912345678', 'BANK_TRANSFER', 'confirmed', 'paid'),
(19, 2, 7650000.00, 1147500.00, 6502500.00, 'Tòa nhà Keangnam Hanoi Landmark, Quận Nam Từ Liêm, Hà Nội', '0912345678', 'CREDIT_CARD', 'cancelled', 'pending');

INSERT INTO `order_items` (`order_id`, `listing_id`, `quantity`, `price`) VALUES
(20, 3, 1, 3590000.00),
(19, 3, 1, 3590000.00);

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================

