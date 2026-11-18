# Celestia Estates

Real estate marketing and sales platform: **Next.js 16 + TypeScript + Tailwind CSS 4 + Prisma + MySQL**.
It ranks on search engines, rewards referral partners for completed deals, and turns visitors into customers.

## Setup
1. `cp .env.example .env` and fill in `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, `SEED_ADMIN_PASSWORD`
2. `npm install`
3. `npx prisma migrate dev --name init` (this schema replaces the earlier one: on an existing dev database Prisma will offer to **reset it, which deletes all data**)
4. `npm run db:seed` (roles, permissions, admin, categories, features, starter commission rules, settings)
5. `npm run dev` then open http://localhost:3000

All 42 tables are documented in [`docs/DATABASE.md`](docs/DATABASE.md).

## How the three goals are met

### 1. Search engine optimisation
- Server-rendered pages with per-page title, description, canonical URL and Open Graph tags (`lib/seo.ts`). Admins can override any of them per property, location, post or page via `seo_metadata` (`POST /api/admin/seo`).
- `sitemap.xml` (properties, locations, blog) and `robots.txt` are generated, and private areas are disallowed.
- JSON-LD: `RealEstateListing` + `BreadcrumbList` on properties, `Article` on posts, `RealEstateAgent` on the home page.
- Location pages `/locations/[slug]` (e.g. `/locations/lugbe-abuja`) are created automatically from property locations.
- Blog (`/blog`, managed at `/admin/blog`) and an admin-managed redirect table (`/api/admin/redirects`) for changed URLs.
- Nobody can guarantee a Google ranking; this gives you the technical foundation. Content quality and links still decide positions.

### 2. Referral and commission system
- Partners join at `/become-a-partner`, are approved at `/admin/partners`, and get a link `/ref/CODE` (add `?to=/properties/slug` to deep-link).
- A 30-day first-touch cookie attributes the lead. Self-referrals and contacts already known to the company are recorded as **rejected**.
- A commission is created only when an admin **completes a transaction**, and completion requires recorded payments to cover the full amount. It starts `PENDING`, an admin approves it, the partner requests a withdrawal, and an admin marks it paid with the bank reference. Every step is audit-logged.
- Rules (`/admin/commissions`) support fixed, percentage, or both, based on the agency commission or the property value. Seeded rules are placeholders.
- Partners are rewarded only for deals, never for recruiting other partners.

### 3. Sales conversion (CRM)
- Every enquiry, callback, info request, WhatsApp click-through or inspection booking becomes a **lead**. Repeat enquiries from an open lead are added to its timeline instead of creating duplicates.
- Pipeline: New → Contacted → Inspection scheduled → Negotiation → Payment processing → Won (or Lost). "Won" happens only through a completed transaction.
- Auto-assignment to the property's agent, otherwise the least busy agent.
- Automated follow-ups: confirmation email immediately; agent reminder after 1 hour; customer follow-up after 24 hours; similar properties after 3 days; "still interested?" after 7 days (`/api/cron/follow-ups`, hourly via `vercel.json`, needs `CRON_SECRET`).
- Funnel analytics at `/admin/analytics`: visitors → property views → leads → inspections → sales, plus referral numbers.

## Roles
`SUPER_ADMIN`, `MANAGER`, `AGENT`, `CUSTOMER`, `REFERRAL_PARTNER`, enforced server-side in every API route (`requireUser`) and dashboard layout (`requirePageRole`). `proxy.ts` only adds early redirects. Only a Super Admin can create commission rules or view audit logs.

## Assumptions to confirm
Own real estate company (not a multi-vendor marketplace), Nigeria-focused (NGN), referral rewards configurable as fixed and/or percentage. The referral terms page is template wording that needs legal review, including tax treatment.

## Not built yet
SMS and WhatsApp Business API sending (`sms_logs` table is ready), testimonials/reviews/messages/documents screens, property comparison, mortgage calculator, admin screens for SEO overrides, redirects, categories and settings (the APIs exist), Redis rate limiting.
