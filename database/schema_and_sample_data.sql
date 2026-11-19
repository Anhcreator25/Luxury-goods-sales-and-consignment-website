-- ==============================================================================
-- AURA VAULT — HAUTE LUXURY CONSIGNMENT PLATFORM
-- DATABASE SCHEMA & SAMPLE DATA (FULL SEED)
-- Target Database: luxury_platform_db (MySQL 8.0+)
-- Synchronized with live database structure
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
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table structure for table `categories`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table structure for table `brands`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL,
  `logo_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  `title` VARCHAR(200) NOT NULL,
  `condition_grade` ENUM('UNWORN', 'VERY_GOOD', 'GOOD', 'FAIR') NOT NULL DEFAULT 'UNWORN',
  `original_price` DECIMAL(12,2) NOT NULL,
  `selling_price` DECIMAL(12,2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'active', 'sold', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table structure for table `listing_images`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `listing_images`;
CREATE TABLE `listing_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_listing` (`user_id`, `listing_id`),
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
  `commission_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `seller_payout` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `shipping_address` TEXT NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'COD',
  `payment_status` ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  `order_status` ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table structure for table `order_items`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `listing_id` INT NOT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Table structure for table `offers`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `offered_price` DECIMAL(12,2) NOT NULL,
  `buyer_note` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Table structure for table `user_bank_accounts`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `user_bank_accounts`;
CREATE TABLE `user_bank_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `bank_name` VARCHAR(100) NOT NULL,
  `bank_account_number` VARCHAR(50) NOT NULL,
  `bank_account_holder` VARCHAR(150) NOT NULL,
  `is_default` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Table structure for table `escrow_payouts`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `escrow_payouts`;
CREATE TABLE `escrow_payouts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL UNIQUE,
  `seller_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `commission_fee` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('pending', 'completed', 'held', 'refunded') NOT NULL DEFAULT 'pending',
  `recipient_bank` VARCHAR(100) DEFAULT NULL,
  `recipient_account` VARCHAR(50) DEFAULT NULL,
  `recipient_name` VARCHAR(150) DEFAULT NULL,
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `disbursed_by` INT DEFAULT NULL,
  `disbursed_at` TIMESTAMP NULL DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`disbursed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- SAMPLE DATA (SEED DATA)
-- ==============================================================================

-- 1. Insert Users (Password: 123456 - Hash Bcrypt 10 rounds: $2a$10$0z8q5wE4q4uS0Y3C8fV8E.O9eA8G0v9C7T6Y3b8o9U0X8Z1V3Q5B2)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Aura Vault Concierge', 'admin@auravault.luxury', '$2a$10$0z8q5wE4q4uS0Y3C8fV8E.O9eA8G0v9C7T6Y3b8o9U0X8Z1V3Q5B2', '19008888', 'admin'),
(2, 'Hoàng Trọng Chung', 'client@auravault.luxury', '$2a$10$0z8q5wE4q4uS0Y3C8fV8E.O9eA8G0v9C7T6Y3b8o9U0X8Z1V3Q5B2', '0912345678', 'user');

-- 2. Insert Core Categories
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Túi Xách Thượng Lưu', 'tui-xach-thuong-luu'),
(2, 'Sneaker & Giày Hiệu', 'sneaker-giay-hieu'),
(3, 'Đồng Hồ Xa Xỉ', 'dong-ho-xa-xi'),
(4, 'Thời Trang Đường Phố', 'thoi-trang-duong-pho'),
(5, 'Trang Sức & Phụ Kiện', 'trang-suc-phu-kien');

-- 3. Insert Brands
INSERT INTO `brands` (`id`, `name`, `slug`, `logo_url`) VALUES
(1, 'Chanel', 'chanel', 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Chanel_logo_interlocking_cs.svg/1200px-Chanel_logo_interlocking_cs.svg.png'),
(2, 'Hermès', 'hermes', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Herm%C3%A8s_logo.svg/1200px-Herm%C3%A8s_logo.svg.png'),
(3, 'Louis Vuitton', 'louis-vuitton', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Louis_Vuitton_logo_and_wordmark.svg/1200px-Louis_Vuitton_logo_and_wordmark.svg.png'),
(4, 'Gucci', 'gucci', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/1960s_Gucci_Logo.svg/1200px-1960s_Gucci_Logo.svg.png'),
(5, 'Dior', 'dior', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Dior_Logo.svg/1200px-Dior_Logo.svg.png'),
(6, 'Nike', 'nike', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png'),
(7, 'Rolex', 'rolex', 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Rolex_logo.svg/1200px-Rolex_logo.svg.png'),
(8, 'Hublot', 'hublot', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Hublot_logo.svg/1200px-Hublot_logo.svg.png'),
(9, 'Patek Philippe', 'patek-philippe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Patek_Philippe_SA_logo.svg/1200px-Patek_Philippe_SA_logo.svg.png'),
(10, 'Cartier', 'cartier', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Cartier_logo.svg/1200px-Cartier_logo.svg.png');

-- 4. Insert Listings
INSERT INTO `listings` (`id`, `seller_id`, `category_id`, `brand_id`, `title`, `condition_grade`, `original_price`, `selling_price`, `description`, `status`) VALUES
(1, 1, 1, 2, 'Vali Hermès R.M.S Cabin Suitcase Phối Da & Vải Canvas', 'UNWORN', 170000000.00, 150000000.00, 'Kiệt tác vali du lịch cao cấp từ Hermès fullbox từ Paris.', 'active'),
(2, 1, 4, 6, 'Áo Khoác Nam Nike Sportswear Air Puffer Mens Winter Jacket Size M', 'UNWORN', 3800000.00, 3200000.00, 'Áo phao lông vũ Nike Air cao cấp, giữ ấm tối đa trong mùa đông.', 'active'),
(3, 1, 2, 6, 'Giày Thể Thao Nam Nike Killshot 2 Ltr Prm Màu Be Size 8.5', 'GOOD', 3700000.00, 3590000.00, 'Mẫu sneaker cổ điển thanh lịch, phụ kiện đi kèm nguyên hộp.', 'active');

-- 5. Insert Listing Images
INSERT INTO `listing_images` (`listing_id`, `image_url`, `is_primary`) VALUES
(1, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 1),
(2, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80', 1),
(3, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', 1);

-- 6. Insert User Bank Account Sample
INSERT INTO `user_bank_accounts` (`id`, `user_id`, `bank_name`, `bank_account_number`, `bank_account_holder`, `is_default`) VALUES
(1, 1, 'Techcombank', '19036789012345', 'AURA VAULT CONCIERGE', 1),
(2, 2, 'Vietcombank', '0071001234567', 'HOANG TRONG CHUNG', 1);

-- 7. Insert Sample Orders
INSERT INTO `orders` (`id`, `buyer_id`, `total_amount`, `commission_fee`, `seller_payout`, `shipping_address`, `phone`, `payment_method`, `payment_status`, `order_status`) VALUES
(1, 2, 3590000.00, 538500.00, 3051500.00, 'Landmark 81, Bình Thạnh, TP.HCM', '0912345678', 'BANK_TRANSFER', 'paid', 'completed');

INSERT INTO `order_items` (`id`, `order_id`, `listing_id`, `price`, `quantity`) VALUES
(1, 1, 3, 3590000.00, 1);

-- 8. Insert Escrow Payout Sample
INSERT INTO `escrow_payouts` (`id`, `order_id`, `seller_id`, `amount`, `commission_fee`, `status`, `recipient_bank`, `recipient_account`, `recipient_name`, `disbursed_by`, `disbursed_at`) VALUES
(1, 1, 1, 3051500.00, 538500.00, 'completed', 'Techcombank', '19036789012345', 'AURA VAULT CONCIERGE', 1, CURRENT_TIMESTAMP);

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
