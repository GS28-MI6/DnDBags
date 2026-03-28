CREATE DATABASE IF NOT EXISTS dndbags CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dndbags;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rulesets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS item_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ruleset_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ruleset_id) REFERENCES rulesets(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_campaigns_created_by (created_by)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campaign_users (
  campaign_id VARCHAR(36) NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (campaign_id, user_id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS base_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruleset_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight DECIMAL(10,3) NOT NULL DEFAULT 0,
  description TEXT,
  item_type_id INT NOT NULL,
  FOREIGN KEY (ruleset_id) REFERENCES rulesets(id),
  FOREIGN KEY (item_type_id) REFERENCES item_types(id),
  INDEX idx_base_items_ruleset (ruleset_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campaign_custom_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight DECIMAL(10,3) NOT NULL DEFAULT 0,
  description TEXT,
  item_type_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (item_type_id) REFERENCES item_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_custom_items_campaign (campaign_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campaign_item_overrides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  base_item_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight DECIMAL(10,3) NOT NULL DEFAULT 0,
  description TEXT,
  item_type_id INT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (base_item_id) REFERENCES base_items(id),
  FOREIGN KEY (item_type_id) REFERENCES item_types(id),
  UNIQUE KEY unique_override (campaign_id, base_item_id),
  INDEX idx_overrides_campaign (campaign_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_characters_campaign (campaign_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS character_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  character_id INT NOT NULL,
  item_source ENUM('base','custom','override') NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  INDEX idx_char_items_character (character_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS character_currency (
  id INT AUTO_INCREMENT PRIMARY KEY,
  character_id INT NOT NULL UNIQUE,
  pc INT NOT NULL DEFAULT 0,
  pp INT NOT NULL DEFAULT 0,
  pe INT NOT NULL DEFAULT 0,
  po INT NOT NULL DEFAULT 0,
  ppt INT NOT NULL DEFAULT 0,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
) ENGINE=InnoDB;
