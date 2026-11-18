-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` ENUM('SUPER_ADMIN', 'MANAGER', 'AGENT', 'CUSTOMER', 'REFERRAL_PARTNER') NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `permissions_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `profile_image` VARCHAR(500) NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_id_idx`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_resets_token_hash_key`(`token_hash`),
    INDEX `password_resets_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `state` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `area` VARCHAR(100) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,

    UNIQUE INDEX `locations_slug_key`(`slug`),
    INDEX `locations_state_city_idx`(`state`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,

    UNIQUE INDEX `property_categories_name_key`(`name`),
    UNIQUE INDEX `property_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `agent_id` BIGINT NULL,
    `owner_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `location_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `address` VARCHAR(255) NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
    `listing_type` ENUM('SALE', 'RENT', 'LEASE') NOT NULL,
    `bedrooms` INTEGER NOT NULL DEFAULT 0,
    `bathrooms` INTEGER NOT NULL DEFAULT 0,
    `toilets` INTEGER NOT NULL DEFAULT 0,
    `area_sqm` DECIMAL(10, 2) NULL,
    `status` ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'RESERVED', 'SOLD', 'RENTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `properties_slug_key`(`slug`),
    INDEX `properties_status_listing_type_idx`(`status`, `listing_type`),
    INDEX `properties_price_idx`(`price`),
    INDEX `properties_agent_id_idx`(`agent_id`),
    INDEX `properties_location_id_idx`(`location_id`),
    INDEX `properties_status_is_featured_idx`(`status`, `is_featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `property_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `alt_text` VARCHAR(255) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `property_images_property_id_idx`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_features` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `property_features_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_feature_assignments` (
    `property_id` BIGINT NOT NULL,
    `feature_id` BIGINT NOT NULL,

    PRIMARY KEY (`property_id`, `feature_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `property_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `favorites_user_id_property_id_key`(`user_id`, `property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `property_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reviews_property_id_idx`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `property_id` BIGINT NULL,
    `customer_id` BIGINT NULL,
    `assigned_agent_id` BIGINT NULL,
    `type` ENUM('ENQUIRY', 'INSPECTION_REQUEST', 'INFO_REQUEST', 'CALLBACK', 'WHATSAPP') NOT NULL DEFAULT 'ENQUIRY',
    `source` ENUM('WEBSITE', 'REFERRAL', 'WHATSAPP', 'PHONE', 'OTHER') NOT NULL DEFAULT 'WEBSITE',
    `stage` ENUM('NEW', 'CONTACTED', 'INSPECTION_SCHEDULED', 'NEGOTIATION', 'PAYMENT_PROCESSING', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `email_norm` VARCHAR(191) NOT NULL,
    `phone_norm` VARCHAR(20) NULL,
    `message` TEXT NULL,
    `preferred_date` DATETIME(3) NULL,
    `lost_reason` VARCHAR(255) NULL,
    `utm_source` VARCHAR(100) NULL,
    `utm_medium` VARCHAR(100) NULL,
    `utm_campaign` VARCHAR(100) NULL,
    `last_contacted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leads_email_norm_idx`(`email_norm`),
    INDEX `leads_phone_norm_idx`(`phone_norm`),
    INDEX `leads_assigned_agent_id_stage_idx`(`assigned_agent_id`, `stage`),
    INDEX `leads_stage_created_at_idx`(`stage`, `created_at`),
    INDEX `leads_property_id_idx`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_activities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT NOT NULL,
    `user_id` BIGINT NULL,
    `type` ENUM('NOTE', 'STAGE_CHANGE', 'ASSIGNMENT', 'CALL', 'EMAIL', 'SYSTEM', 'REPEAT_ENQUIRY') NOT NULL,
    `body` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_activities_lead_id_created_at_idx`(`lead_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT NOT NULL,
    `agent_id` BIGINT NOT NULL,
    `assigned_by_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_assignments_lead_id_idx`(`lead_id`),
    INDEX `lead_assignments_agent_id_idx`(`agent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow_up_tasks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT NOT NULL,
    `kind` ENUM('AGENT_NOTIFY', 'CUSTOMER_FOLLOWUP', 'RECOMMENDATIONS', 'STILL_INTERESTED') NOT NULL,
    `status` ENUM('SCHEDULED', 'DONE', 'SKIPPED', 'FAILED') NOT NULL DEFAULT 'SCHEDULED',
    `scheduled_for` DATETIME(3) NOT NULL,
    `executed_at` DATETIME(3) NULL,
    `error` VARCHAR(255) NULL,

    INDEX `follow_up_tasks_status_scheduled_for_idx`(`status`, `scheduled_for`),
    INDEX `follow_up_tasks_lead_id_idx`(`lead_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspections` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT NULL,
    `property_id` BIGINT NOT NULL,
    `customer_id` BIGINT NULL,
    `agent_id` BIGINT NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `inspections_property_id_idx`(`property_id`),
    INDEX `inspections_agent_id_scheduled_at_idx`(`agent_id`, `scheduled_at`),
    INDEX `inspections_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deals` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT NULL,
    `property_id` BIGINT NOT NULL,
    `customer_id` BIGINT NULL,
    `agent_id` BIGINT NULL,
    `deal_type` ENUM('SALE', 'RENTAL', 'LEASE') NOT NULL,
    `agreed_amount` DECIMAL(15, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
    `status` ENUM('OPEN', 'WON', 'LOST') NOT NULL DEFAULT 'OPEN',
    `closed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `deals_lead_id_idx`(`lead_id`),
    INDEX `deals_property_id_idx`(`property_id`),
    INDEX `deals_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `deal_id` BIGINT NULL,
    `property_id` BIGINT NOT NULL,
    `customer_id` BIGINT NULL,
    `agent_id` BIGINT NULL,
    `buyer_name` VARCHAR(150) NOT NULL,
    `buyer_email` VARCHAR(191) NULL,
    `buyer_phone` VARCHAR(30) NULL,
    `transaction_type` ENUM('SALE', 'RENTAL', 'LEASE') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `agency_commission` DECIMAL(15, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
    `status` ENUM('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    INDEX `transactions_property_id_idx`(`property_id`),
    INDEX `transactions_customer_id_idx`(`customer_id`),
    INDEX `transactions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `method` VARCHAR(50) NULL,
    `reference` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paid_at` DATETIME(3) NULL,
    `recorded_by_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_reference_key`(`reference`),
    INDEX `payments_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `payment_id` BIGINT NOT NULL,
    `provider` VARCHAR(30) NOT NULL DEFAULT 'paystack',
    `reference` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
    `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `raw_payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_transactions_reference_key`(`reference`),
    INDEX `payment_transactions_payment_id_idx`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_partners` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `bank_name` VARCHAR(100) NULL,
    `account_number` VARCHAR(20) NULL,
    `account_name` VARCHAR(150) NULL,
    `terms_accepted_at` DATETIME(3) NULL,
    `approved_by_id` BIGINT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `referral_partners_user_id_key`(`user_id`),
    INDEX `referral_partners_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_codes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `partner_id` BIGINT NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `referral_codes_code_key`(`code`),
    INDEX `referral_codes_partner_id_idx`(`partner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_clicks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code_id` BIGINT NOT NULL,
    `ip_hash` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `landing_path` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `referral_clicks_code_id_created_at_idx`(`code_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_attributions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `partner_id` BIGINT NOT NULL,
    `code_id` BIGINT NOT NULL,
    `lead_id` BIGINT NOT NULL,
    `status` ENUM('PENDING', 'CONVERTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejection_reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `referral_attributions_lead_id_key`(`lead_id`),
    INDEX `referral_attributions_partner_id_status_idx`(`partner_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `transaction_type` ENUM('SALE', 'RENTAL', 'LEASE') NULL,
    `category_id` BIGINT NULL,
    `min_property_value` DECIMAL(15, 2) NULL,
    `max_property_value` DECIMAL(15, 2) NULL,
    `calc_type` ENUM('FIXED', 'PERCENTAGE', 'BOTH') NOT NULL,
    `base` ENUM('AGENCY_COMMISSION', 'PROPERTY_VALUE') NOT NULL DEFAULT 'AGENCY_COMMISSION',
    `fixed_amount` DECIMAL(15, 2) NULL,
    `percentage` DECIMAL(5, 2) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `commission_rules_is_active_priority_idx`(`is_active`, `priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commissions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `partner_id` BIGINT NOT NULL,
    `attribution_id` BIGINT NOT NULL,
    `transaction_id` BIGINT NOT NULL,
    `rule_id` BIGINT NULL,
    `payout_id` BIGINT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approved_by_id` BIGINT NULL,
    `approved_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `commissions_attribution_id_key`(`attribution_id`),
    UNIQUE INDEX `commissions_transaction_id_key`(`transaction_id`),
    INDEX `commissions_partner_id_status_idx`(`partner_id`, `status`),
    INDEX `commissions_payout_id_idx`(`payout_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_payouts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `partner_id` BIGINT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('REQUESTED', 'APPROVED', 'PAID', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    `bank_name` VARCHAR(100) NULL,
    `account_number` VARCHAR(20) NULL,
    `account_name` VARCHAR(150) NULL,
    `payment_reference` VARCHAR(191) NULL,
    `processed_by_id` BIGINT NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,

    INDEX `commission_payouts_partner_id_status_idx`(`partner_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,

    UNIQUE INDEX `blog_categories_name_key`(`name`),
    UNIQUE INDEX `blog_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT NOT NULL,
    `category_id` BIGINT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` VARCHAR(500) NULL,
    `content` LONGTEXT NOT NULL,
    `cover_image` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `blog_posts_status_published_at_idx`(`status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonials` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `author_name` VARCHAR(150) NOT NULL,
    `author_role` VARCHAR(150) NULL,
    `content` TEXT NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seo_metadata` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `entity_type` ENUM('PROPERTY', 'LOCATION', 'BLOG', 'PAGE') NOT NULL,
    `entity_key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `description` VARCHAR(500) NULL,
    `canonical_url` VARCHAR(500) NULL,
    `og_image` VARCHAR(500) NULL,
    `no_index` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seo_metadata_entity_type_entity_key_key`(`entity_type`, `entity_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `redirects` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `from_path` VARCHAR(191) NOT NULL,
    `to_path` VARCHAR(500) NOT NULL,
    `status_code` INTEGER NOT NULL DEFAULT 301,
    `hits` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `redirects_from_path_key`(`from_path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sender_id` BIGINT NOT NULL,
    `recipient_id` BIGINT NOT NULL,
    `body` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `messages_recipient_id_is_read_idx`(`recipient_id`, `is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `property_id` BIGINT NULL,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `lead_id` BIGINT NULL,
    `to_email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `template` VARCHAR(60) NULL,
    `status` ENUM('SENT', 'FAILED') NOT NULL,
    `error` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_logs_lead_id_idx`(`lead_id`),
    INDEX `email_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `lead_id` BIGINT NULL,
    `to_phone` VARCHAR(30) NOT NULL,
    `body` VARCHAR(480) NOT NULL,
    `provider` VARCHAR(40) NULL,
    `status` ENUM('SENT', 'FAILED') NOT NULL,
    `error` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sms_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` ENUM('PAGE_VIEW', 'PROPERTY_VIEW', 'WHATSAPP_CLICK') NOT NULL,
    `session_id` VARCHAR(64) NOT NULL,
    `path` VARCHAR(255) NULL,
    `property_id` BIGINT NULL,
    `referral_code_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_type_created_at_idx`(`type`, `created_at`),
    INDEX `analytics_events_property_id_idx`(`property_id`),
    INDEX `analytics_events_session_id_idx`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `property_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_images` ADD CONSTRAINT `property_images_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_feature_assignments` ADD CONSTRAINT `property_feature_assignments_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_feature_assignments` ADD CONSTRAINT `property_feature_assignments_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `property_features`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_assigned_agent_id_fkey` FOREIGN KEY (`assigned_agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_tasks` ADD CONSTRAINT `follow_up_tasks_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deals` ADD CONSTRAINT `deals_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deals` ADD CONSTRAINT `deals_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deals` ADD CONSTRAINT `deals_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deals` ADD CONSTRAINT `deals_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_deal_id_fkey` FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_recorded_by_id_fkey` FOREIGN KEY (`recorded_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_partners` ADD CONSTRAINT `referral_partners_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_partners` ADD CONSTRAINT `referral_partners_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_codes` ADD CONSTRAINT `referral_codes_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `referral_partners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_clicks` ADD CONSTRAINT `referral_clicks_code_id_fkey` FOREIGN KEY (`code_id`) REFERENCES `referral_codes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_attributions` ADD CONSTRAINT `referral_attributions_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `referral_partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_attributions` ADD CONSTRAINT `referral_attributions_code_id_fkey` FOREIGN KEY (`code_id`) REFERENCES `referral_codes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_attributions` ADD CONSTRAINT `referral_attributions_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `property_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `referral_partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_attribution_id_fkey` FOREIGN KEY (`attribution_id`) REFERENCES `referral_attributions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `commission_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_payout_id_fkey` FOREIGN KEY (`payout_id`) REFERENCES `commission_payouts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `referral_partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_processed_by_id_fkey` FOREIGN KEY (`processed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
