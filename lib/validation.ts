import { z } from "zod";

const money = z.coerce.number().positive().max(1_000_000_000_000);
const optionalText = (max: number) => z.string().trim().max(max).optional();

// ---------- auth & profile ----------
export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(191),
  phone: optionalText(30),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});
export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  profileImage: z.string().url().max(500).nullable().optional(),
});
export const favoriteSchema = z.object({ propertyId: z.coerce.bigint() });

// ---------- properties ----------
export const propertySchema = z.object({
  title: z.string().trim().min(5).max(255),
  description: z.string().trim().min(20),
  price: money,
  currency: z.string().length(3).default("NGN"),
  listingType: z.enum(["SALE", "RENT", "LEASE"]),
  categoryId: z.coerce.bigint(),
  location: z.object({
    state: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    area: z.string().trim().max(100).optional(),
  }),
  address: optionalText(255),
  agentId: z.coerce.bigint().nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).default(0),
  bathrooms: z.coerce.number().int().min(0).default(0),
  toilets: z.coerce.number().int().min(0).default(0),
  areaSqm: z.coerce.number().positive().optional(),
  isFeatured: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  featureIds: z.array(z.coerce.bigint()).default([]),
});
export const propertyUpdateSchema = propertySchema.partial();

export const propertyQuerySchema = z.object({
  listingType: z.enum(["sale", "rent", "lease"]).optional(),
  location: z.string().trim().max(100).optional(),
  locationSlug: z.string().trim().max(191).optional(),
  category: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ---------- leads / CRM ----------
export const leadSchema = z.object({
  propertyId: z.coerce.bigint().optional(),
  type: z.enum(["ENQUIRY", "INSPECTION_REQUEST", "INFO_REQUEST", "CALLBACK", "WHATSAPP"]).default("ENQUIRY"),
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(191),
  phone: optionalText(30),
  message: z.string().trim().max(2000).optional(),
  preferredDate: z.coerce.date().optional(),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(100),
});

export const STAGES = ["NEW", "CONTACTED", "INSPECTION_SCHEDULED", "NEGOTIATION", "PAYMENT_PROCESSING", "LOST"] as const;
export const leadUpdateSchema = z.object({
  // WON is intentionally absent: a lead is only won when a transaction is completed.
  stage: z.enum(STAGES).optional(),
  assignedAgentId: z.coerce.bigint().nullable().optional(),
  lostReason: optionalText(255),
});
export const leadActivitySchema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL"]).default("NOTE"),
  body: z.string().trim().min(1).max(2000),
});

export const inspectionSchema = z.object({
  propertyId: z.coerce.bigint(),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), "Choose a future date and time"),
  notes: optionalText(1000),
});
export const inspectionUpdateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "RESCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  scheduledAt: z.coerce.date().optional(),
  notes: optionalText(1000),
});

// ---------- users ----------
export const createUserSchema = registerSchema.extend({
  role: z.enum(["MANAGER", "AGENT", "CUSTOMER"]),
});
export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
  role: z.enum(["MANAGER", "AGENT", "CUSTOMER"]).optional(),
});

// ---------- referral partners & commissions ----------
export const partnerRegisterSchema = registerSchema.extend({
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the referral terms" }) }),
});
export const partnerProfileSchema = z.object({
  bankName: z.string().trim().min(2).max(100),
  accountNumber: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit NUBAN account number"),
  accountName: z.string().trim().min(2).max(150),
});
export const partnerStatusSchema = z.object({ status: z.enum(["APPROVED", "SUSPENDED", "REJECTED"]) });

export const commissionRuleSchema = z
  .object({
    name: z.string().trim().min(3).max(150),
    transactionType: z.enum(["SALE", "RENTAL", "LEASE"]).nullable().optional(),
    categoryId: z.coerce.bigint().nullable().optional(),
    minPropertyValue: z.coerce.number().nonnegative().nullable().optional(),
    maxPropertyValue: z.coerce.number().positive().nullable().optional(),
    calcType: z.enum(["FIXED", "PERCENTAGE", "BOTH"]),
    base: z.enum(["AGENCY_COMMISSION", "PROPERTY_VALUE"]).default("AGENCY_COMMISSION"),
    fixedAmount: z.coerce.number().positive().nullable().optional(),
    percentage: z.coerce.number().positive().max(100).nullable().optional(),
    priority: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),
  })
  .refine((r) => r.calcType === "PERCENTAGE" || !!r.fixedAmount, { message: "fixedAmount is required", path: ["fixedAmount"] })
  .refine((r) => r.calcType === "FIXED" || !!r.percentage, { message: "percentage is required", path: ["percentage"] });

export const commissionDecisionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: optionalText(255),
});
export const payoutDecisionSchema = z.object({
  action: z.enum(["approve", "paid", "reject"]),
  paymentReference: optionalText(191),
});

// ---------- transactions & payments ----------
export const transactionCreateSchema = z.object({
  leadId: z.coerce.bigint().optional(),
  propertyId: z.coerce.bigint().optional(),
  customerId: z.coerce.bigint().nullable().optional(),
  buyerName: optionalText(150),
  buyerEmail: z.string().trim().toLowerCase().email().optional(),
  buyerPhone: optionalText(30),
  transactionType: z.enum(["SALE", "RENTAL", "LEASE"]).optional(),
  amount: money,
});
export const paymentCreateSchema = z.object({
  amount: money,
  method: z.string().trim().max(50).default("bank_transfer"),
  reference: optionalText(191),
});
export const completeTransactionSchema = z.object({
  agencyCommission: z.coerce.number().nonnegative().optional(),
});
export const paystackInitSchema = z.object({
  transactionId: z.coerce.bigint(),
  amount: money.optional(),
});

// ---------- content & SEO ----------
export const blogSchema = z.object({
  title: z.string().trim().min(5).max(255),
  excerpt: optionalText(500),
  content: z.string().trim().min(50),
  coverImage: z.string().url().max(500).optional(),
  categoryId: z.coerce.bigint().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});
export const blogUpdateSchema = blogSchema.partial();

export const redirectSchema = z.object({
  fromPath: z.string().trim().startsWith("/").max(191),
  toPath: z.string().trim().max(500).refine((p) => p.startsWith("/") || p.startsWith("https://"), "Use a path or an https URL"),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).default(301),
});
export const seoSchema = z.object({
  entityType: z.enum(["PROPERTY", "LOCATION", "BLOG", "PAGE"]),
  entityKey: z.string().trim().min(1).max(191),
  title: optionalText(255),
  description: optionalText(500),
  canonicalUrl: z.string().url().max(500).optional(),
  ogImage: z.string().url().max(500).optional(),
  noIndex: z.boolean().default(false),
});

export const trackSchema = z.object({
  type: z.enum(["PAGE_VIEW", "PROPERTY_VIEW", "WHATSAPP_CLICK"]),
  sessionId: z.string().min(8).max(64),
  path: z.string().max(255).optional(),
  propertyId: z.coerce.bigint().optional(),
});

// ---------- inquiries ----------
export const inquiryUpdateSchema = z.object({
  status: z.string().trim().min(1).max(50).optional(),
  assignedAgentId: z.coerce.bigint().positive().nullable().optional(),
});
