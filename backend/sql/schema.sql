-- ArtisanConnect initial schema (beginner-friendly)
-- Run in XAMPP MySQL: import this file into the `artisanconnect` database.

CREATE DATABASE IF NOT EXISTS artisanconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE artisanconnect;

-- Users (client accounts)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Artisan categories (drives platform fee + tax rate)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(80) NOT NULL UNIQUE,
  platform_fee INT NOT NULL DEFAULT 0,
  tax_rate DECIMAL(6,5) NOT NULL DEFAULT 0.00000,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Artisans
CREATE TABLE IF NOT EXISTS artisans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  service VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  reviews INT NOT NULL DEFAULT 0,

  hourly_rate INT NOT NULL DEFAULT 0,
  price_range VARCHAR(40) NULL,

  avatar_url VARCHAR(512) NULL,
  image_url VARCHAR(512) NULL,
  description TEXT NULL,

  city VARCHAR(80) NULL,
  state VARCHAR(80) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,

  tags_json TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_artisans_category (category),
  INDEX idx_artisans_city_state (city, state)
);

CREATE TABLE IF NOT EXISTS artisan_works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artisan_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  image_url VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_works_artisan
    FOREIGN KEY (artisan_id) REFERENCES artisans(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artisan_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artisan_id INT NOT NULL,
  reviewer_name VARCHAR(120) NULL,
  rating DECIMAL(3,2) NOT NULL,
  review_text TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_artisan
    FOREIGN KEY (artisan_id) REFERENCES artisans(id)
    ON DELETE CASCADE
);

-- Conversations between a user and an artisan
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  artisan_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_convo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_convo_artisan FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_artisan (user_id, artisan_id),
  INDEX idx_convo_artisan (artisan_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'system' | 'user' | 'artisan'
  sender_id INT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_convo FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_messages_convo_created (conversation_id, created_at)
);

-- Orders created from the hire flow
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  artisan_id INT NOT NULL,

  hours INT NOT NULL,
  needs TEXT NULL,
  address TEXT NULL,

  materials_estimate INT NOT NULL DEFAULT 0,
  service_fee INT NOT NULL DEFAULT 0,
  materials_fee INT NOT NULL DEFAULT 0,
  platform_fee INT NOT NULL DEFAULT 0,
  tax_rate DECIMAL(6,5) NOT NULL DEFAULT 0.00000,
  tax_fee INT NOT NULL DEFAULT 0,
  total_amount INT NOT NULL DEFAULT 0,

  payment_method VARCHAR(20) NOT NULL DEFAULT 'card', -- 'card' | 'transfer'
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending' | 'awaiting-confirmation' | 'paid'
  status VARCHAR(30) NOT NULL DEFAULT 'created',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_artisan FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_artisan (artisan_id)
);

