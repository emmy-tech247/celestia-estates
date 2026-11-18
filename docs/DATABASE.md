# Celestia Estates: database schema

Generated from `prisma/schema.prisma` (the source of truth). MySQL via Prisma 6. Primary keys are `BIGINT AUTO_INCREMENT` unless noted.

**42 tables.**


## 1. Users & Access

### `roles`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `name` | RoleName | unique |

### `permissions`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `key` | VarChar(100) | unique |
| `description` | VarChar(255) | nullable |

### `role_permissions`
| Column | Type | Notes |
|---|---|---|
| `role_id` | BigInt |  |
| `permission_id` | BigInt |  |

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `role_id` | BigInt |  |
| `full_name` | VarChar(150) |  |
| `email` | VarChar(191) | unique |
| `phone` | VarChar(30) | nullable |
| `password_hash` | VarChar(255) |  |
| `profile_image` | VarChar(500) | nullable |
| `status` | UserStatus | default ACTIVE |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (roleId)

### `password_resets`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt |  |
| `token_hash` | VarChar(64) | unique |
| `expires_at` | DateTime |  |
| `used_at` | DateTime | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (userId)


## 2. Properties

### `locations`
One row per place. `area` is the neighbourhood (e.g. Lugbe); a row with a null area represents the city itself. `slug` powers /locations/[slug] SEO pages.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `state` | VarChar(100) |  |
| `city` | VarChar(100) |  |
| `area` | VarChar(100) | nullable |
| `slug` | VarChar(191) | unique |
| `latitude` | Decimal(10, 7) | nullable |
| `longitude` | Decimal(10, 7) | nullable |

Indexes: index (state, city)

### `property_categories`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `name` | VarChar(100) | unique |
| `slug` | VarChar(120) | unique |

### `properties`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `agent_id` | BigInt | nullable |
| `owner_id` | BigInt |  |
| `category_id` | BigInt |  |
| `location_id` | BigInt |  |
| `title` | VarChar(255) |  |
| `slug` | VarChar(255) | unique |
| `description` | Text |  |
| `address` | VarChar(255) | nullable |
| `price` | Decimal(15, 2) |  |
| `currency` | VarChar(3) | default "NGN" |
| `listing_type` | ListingType |  |
| `bedrooms` | Int | default 0 |
| `bathrooms` | Int | default 0 |
| `toilets` | Int | default 0 |
| `area_sqm` | Decimal(10, 2) | nullable |
| `status` | PropertyStatus | default DRAFT |
| `is_featured` | Boolean | default false |
| `is_verified` | Boolean | default false |
| `published_at` | DateTime | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (status, listingType); index (price); index (agentId); index (locationId); index (status, isFeatured)

### `property_images`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `property_id` | BigInt |  |
| `image_url` | VarChar(500) |  |
| `alt_text` | VarChar(255) | nullable |
| `is_primary` | Boolean | default false |
| `sort_order` | Int | default 0 |

Indexes: index (propertyId)

### `property_features`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `name` | VarChar(100) | unique |

### `property_feature_assignments`
| Column | Type | Notes |
|---|---|---|
| `property_id` | BigInt |  |
| `feature_id` | BigInt |  |

### `favorites`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt |  |
| `property_id` | BigInt |  |
| `created_at` | DateTime | default now() |

Indexes: unique (userId, propertyId)

### `reviews`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `property_id` | BigInt |  |
| `user_id` | BigInt |  |
| `rating` | Int |  |
| `comment` | Text | nullable |
| `status` | ReviewStatus | default PENDING |
| `created_at` | DateTime | default now() |

Indexes: index (propertyId)


## 3. Leads / CRM

### `leads`
Every enquiry, callback, inspection request or WhatsApp contact becomes a lead. emailNorm / phoneNorm are normalised copies used for duplicate detection.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `property_id` | BigInt | nullable |
| `customer_id` | BigInt | nullable |
| `assigned_agent_id` | BigInt | nullable |
| `type` | LeadType | default ENQUIRY |
| `source` | LeadSource | default WEBSITE |
| `stage` | LeadStage | default NEW |
| `name` | VarChar(150) |  |
| `email` | VarChar(191) |  |
| `phone` | VarChar(30) | nullable |
| `email_norm` | VarChar(191) |  |
| `phone_norm` | VarChar(20) | nullable |
| `message` | Text | nullable |
| `preferred_date` | DateTime | nullable |
| `lost_reason` | VarChar(255) | nullable |
| `utm_source` | VarChar(100) | nullable |
| `utm_medium` | VarChar(100) | nullable |
| `utm_campaign` | VarChar(100) | nullable |
| `last_contacted_at` | DateTime | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (emailNorm); index (phoneNorm); index (assignedAgentId, stage); index (stage, createdAt); index (propertyId)

### `lead_activities`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `lead_id` | BigInt |  |
| `user_id` | BigInt | nullable |
| `type` | LeadActivityType |  |
| `body` | Text | nullable |
| `metadata` | Json | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (leadId, createdAt)

### `lead_assignments`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `lead_id` | BigInt |  |
| `agent_id` | BigInt |  |
| `assigned_by_id` | BigInt | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (leadId); index (agentId)

### `follow_up_tasks`
Scheduled automated follow-ups (processed by /api/cron/follow-ups).

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `lead_id` | BigInt |  |
| `kind` | FollowUpKind |  |
| `status` | FollowUpStatus | default SCHEDULED |
| `scheduled_for` | DateTime |  |
| `executed_at` | DateTime | nullable |
| `error` | VarChar(255) | nullable |

Indexes: index (status, scheduledFor); index (leadId)


## 4. Sales: inspections, deals, transactions

### `inspections`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `lead_id` | BigInt | nullable |
| `property_id` | BigInt |  |
| `customer_id` | BigInt | nullable |
| `agent_id` | BigInt | nullable |
| `scheduled_at` | DateTime |  |
| `status` | InspectionStatus | default PENDING |
| `notes` | Text | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (propertyId); index (agentId, scheduledAt); index (customerId)

### `deals`
A negotiation in progress for one lead and property.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `lead_id` | BigInt | nullable |
| `property_id` | BigInt |  |
| `customer_id` | BigInt | nullable |
| `agent_id` | BigInt | nullable |
| `deal_type` | TransactionType |  |
| `agreed_amount` | Decimal(15, 2) | nullable |
| `currency` | VarChar(3) | default "NGN" |
| `status` | DealStatus | default OPEN |
| `closed_at` | DateTime | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (leadId); index (propertyId); index (status)

### `transactions`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `deal_id` | BigInt | nullable |
| `property_id` | BigInt |  |
| `customer_id` | BigInt | nullable |
| `agent_id` | BigInt | nullable |
| `buyer_name` | VarChar(150) |  |
| `buyer_email` | VarChar(191) | nullable |
| `buyer_phone` | VarChar(30) | nullable |
| `transaction_type` | TransactionType |  |
| `amount` | Decimal(15, 2) |  |
| `agency_commission` | Decimal(15, 2) | nullable |
| `currency` | VarChar(3) | default "NGN" |
| `status` | TransactionStatus | default PENDING |
| `transaction_date` | DateTime | default now() |
| `completed_at` | DateTime | nullable |

Indexes: index (propertyId); index (customerId); index (status)


## 5. Payments

### `payments`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `transaction_id` | BigInt |  |
| `amount` | Decimal(15, 2) |  |
| `method` | VarChar(50) | nullable |
| `reference` | VarChar(191) | unique, nullable |
| `status` | PaymentStatus | default PENDING |
| `paid_at` | DateTime | nullable |
| `recorded_by_id` | BigInt | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (transactionId)

### `payment_transactions`
Raw gateway (Paystack) records, kept separately for reconciliation.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `payment_id` | BigInt |  |
| `provider` | VarChar(30) | default "paystack" |
| `reference` | VarChar(191) | unique |
| `amount` | Decimal(15, 2) |  |
| `currency` | VarChar(3) | default "NGN" |
| `status` | PaymentStatus | default PENDING |
| `raw_payload` | Json | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (paymentId)


## 6. Referrals

### `referral_partners`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt | unique |
| `status` | PartnerStatus | default PENDING |
| `bank_name` | VarChar(100) | nullable |
| `account_number` | VarChar(20) | nullable |
| `account_name` | VarChar(150) | nullable |
| `terms_accepted_at` | DateTime | nullable |
| `approved_by_id` | BigInt | nullable |
| `approved_at` | DateTime | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (status)

### `referral_codes`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `partner_id` | BigInt |  |
| `code` | VarChar(40) | unique |
| `is_active` | Boolean | default true |
| `created_at` | DateTime | default now() |

Indexes: index (partnerId)

### `referral_clicks`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `code_id` | BigInt |  |
| `ip_hash` | VarChar(64) | nullable |
| `user_agent` | VarChar(255) | nullable |
| `landing_path` | VarChar(255) | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (codeId, createdAt)

### `referral_attributions`
Ownership record: which partner introduced which lead. One per lead, first touch wins.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `partner_id` | BigInt |  |
| `code_id` | BigInt |  |
| `lead_id` | BigInt | unique |
| `status` | AttributionStatus | default PENDING |
| `rejection_reason` | VarChar(255) | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (partnerId, status)


## 7. Commissions

### `commission_rules`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `name` | VarChar(150) |  |
| `transaction_type` | TransactionType | nullable |
| `category_id` | BigInt | nullable |
| `min_property_value` | Decimal(15, 2) | nullable |
| `max_property_value` | Decimal(15, 2) | nullable |
| `calc_type` | CommissionCalc |  |
| `base` | CommissionBase | default AGENCY_COMMISSION |
| `fixed_amount` | Decimal(15, 2) | nullable |
| `percentage` | Decimal(5, 2) | nullable |
| `priority` | Int | default 0 |
| `is_active` | Boolean | default true |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (isActive, priority)

### `commissions`
One commission per completed transaction. Created PENDING, approved by an admin, then included in a payout.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `partner_id` | BigInt |  |
| `attribution_id` | BigInt | unique |
| `transaction_id` | BigInt | unique |
| `rule_id` | BigInt | nullable |
| `payout_id` | BigInt | nullable |
| `amount` | Decimal(15, 2) |  |
| `status` | CommissionStatus | default PENDING |
| `approved_by_id` | BigInt | nullable |
| `approved_at` | DateTime | nullable |
| `rejection_reason` | VarChar(255) | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (partnerId, status); index (payoutId)

### `commission_payouts`
A withdrawal request. Bank details are snapshotted at request time.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `partner_id` | BigInt |  |
| `amount` | Decimal(15, 2) |  |
| `status` | PayoutStatus | default REQUESTED |
| `bank_name` | VarChar(100) | nullable |
| `account_number` | VarChar(20) | nullable |
| `account_name` | VarChar(150) | nullable |
| `payment_reference` | VarChar(191) | nullable |
| `processed_by_id` | BigInt | nullable |
| `requested_at` | DateTime | default now() |
| `processed_at` | DateTime | nullable |

Indexes: index (partnerId, status)


## 8. Marketing

### `blog_categories`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `name` | VarChar(100) | unique |
| `slug` | VarChar(120) | unique |

### `blog_posts`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `author_id` | BigInt |  |
| `category_id` | BigInt | nullable |
| `title` | VarChar(255) |  |
| `slug` | VarChar(255) | unique |
| `excerpt` | VarChar(500) | nullable |
| `content` | LongText |  |
| `cover_image` | VarChar(500) | nullable |
| `status` | BlogStatus | default DRAFT |
| `published_at` | DateTime | nullable |
| `created_at` | DateTime | default now() |
| `updated_at` | DateTime |  |

Indexes: index (status, publishedAt)

### `testimonials`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `author_name` | VarChar(150) |  |
| `author_role` | VarChar(150) | nullable |
| `content` | Text |  |
| `rating` | Int | default 5 |
| `is_published` | Boolean | default false |
| `created_at` | DateTime | default now() |


## 9. SEO

### `seo_metadata`
Per-entity overrides for title/description/canonical/OG image/noindex. entityKey is the property slug, location slug, blog slug or page path.

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `entity_type` | SeoEntity |  |
| `entity_key` | VarChar(191) |  |
| `title` | VarChar(255) | nullable |
| `description` | VarChar(500) | nullable |
| `canonical_url` | VarChar(500) | nullable |
| `og_image` | VarChar(500) | nullable |
| `no_index` | Boolean | default false |
| `updated_at` | DateTime |  |

Indexes: unique (entityType, entityKey)

### `redirects`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `from_path` | VarChar(191) | unique |
| `to_path` | VarChar(500) |  |
| `status_code` | Int | default 301 |
| `hits` | Int | default 0 |
| `created_at` | DateTime | default now() |


## 10. Notifications & Logs

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt |  |
| `title` | VarChar(191) |  |
| `body` | Text | nullable |
| `is_read` | Boolean | default false |
| `created_at` | DateTime | default now() |

Indexes: index (userId, isRead)

### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `sender_id` | BigInt |  |
| `recipient_id` | BigInt |  |
| `body` | Text |  |
| `is_read` | Boolean | default false |
| `created_at` | DateTime | default now() |

Indexes: index (recipientId, isRead)

### `documents`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `property_id` | BigInt | nullable |
| `user_id` | BigInt |  |
| `title` | VarChar(191) |  |
| `file_url` | VarChar(500) |  |
| `created_at` | DateTime | default now() |

### `email_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt | nullable |
| `lead_id` | BigInt | nullable |
| `to_email` | VarChar(191) |  |
| `subject` | VarChar(255) |  |
| `template` | VarChar(60) | nullable |
| `status` | LogStatus |  |
| `error` | VarChar(255) | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (leadId); index (createdAt)

### `sms_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt | nullable |
| `lead_id` | BigInt | nullable |
| `to_phone` | VarChar(30) |  |
| `body` | VarChar(480) |  |
| `provider` | VarChar(40) | nullable |
| `status` | LogStatus |  |
| `error` | VarChar(255) | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (createdAt)


## 11. Administration & Analytics

### `audit_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `user_id` | BigInt | nullable |
| `action` | VarChar(100) |  |
| `entity_type` | VarChar(50) |  |
| `entity_id` | VarChar(50) | nullable |
| `metadata` | Json | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (entityType, entityId); index (createdAt)

### `system_settings`
| Column | Type | Notes |
|---|---|---|
| `key` | VarChar(100) | PK |
| `value` | Json |  |
| `updated_at` | DateTime |  |

### `analytics_events`
First-party analytics for the conversion funnel (visitors → views → leads → sales).

| Column | Type | Notes |
|---|---|---|
| `id` | BigInt | PK |
| `type` | AnalyticsEventType |  |
| `session_id` | VarChar(64) |  |
| `path` | VarChar(255) | nullable |
| `property_id` | BigInt | nullable |
| `referral_code_id` | BigInt | nullable |
| `created_at` | DateTime | default now() |

Indexes: index (type, createdAt); index (propertyId); index (sessionId)
