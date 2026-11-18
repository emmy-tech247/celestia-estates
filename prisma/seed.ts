import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Permission catalogue (role-based checks in the API use roles today; this table is ready for finer-grained checks).
const PERMISSIONS: Record<string, RoleName[]> = {
  "properties.manage": ["SUPER_ADMIN", "MANAGER"],
  "properties.edit_assigned": ["AGENT"],
  "leads.manage_all": ["SUPER_ADMIN", "MANAGER"],
  "leads.manage_assigned": ["AGENT"],
  "inspections.manage": ["SUPER_ADMIN", "MANAGER"],
  "users.manage": ["SUPER_ADMIN", "MANAGER"],
  "partners.approve": ["SUPER_ADMIN", "MANAGER"],
  "commissions.approve": ["SUPER_ADMIN", "MANAGER"],
  "commission_rules.manage": ["SUPER_ADMIN"],
  "transactions.manage": ["SUPER_ADMIN", "MANAGER"],
  "blog.manage": ["SUPER_ADMIN", "MANAGER"],
  "seo.manage": ["SUPER_ADMIN", "MANAGER"],
  "audit.view": ["SUPER_ADMIN"],
  "referrals.use": ["REFERRAL_PARTNER"],
  "favorites.use": ["CUSTOMER"],
};

async function main() {
  const roles: Record<string, bigint> = {};
  for (const name of Object.values(RoleName)) {
    roles[name] = (await prisma.role.upsert({ where: { name }, update: {}, create: { name } })).id;
  }

  for (const [key, allowed] of Object.entries(PERMISSIONS)) {
    const p = await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
    for (const r of allowed) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[r], permissionId: p.id } },
        update: {},
        create: { roleId: roles[r], permissionId: p.id },
      });
    }
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@celestiaestates.com";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("Set SEED_ADMIN_PASSWORD in .env before seeding.");
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { roleId: roles.SUPER_ADMIN, fullName: "Super Admin", email, passwordHash: await bcrypt.hash(password, 12) },
  });

  for (const name of ["Apartment", "Duplex", "Detached House", "Land", "Commercial", "Office Space"]) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.propertyCategory.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  for (const name of ["Swimming Pool", "Parking", "24/7 Security", "Generator", "Gym", "Water Supply"]) {
    await prisma.propertyFeature.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of ["Buying Guides", "Renting Tips", "Investment", "Neighbourhoods"]) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.blogCategory.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

  // Starter commission rules. These are placeholders: set your own policy at /admin/commissions.
  const rules = [
    { name: "Default sale reward (20% of agency commission)", transactionType: "SALE", calcType: "PERCENTAGE", base: "AGENCY_COMMISSION", percentage: 20 },
    { name: "Default rental reward (fixed)", transactionType: "RENTAL", calcType: "FIXED", base: "AGENCY_COMMISSION", fixedAmount: 50000 },
    { name: "Default lease reward (fixed)", transactionType: "LEASE", calcType: "FIXED", base: "AGENCY_COMMISSION", fixedAmount: 50000 },
  ] as const;
  for (const r of rules) {
    if (!(await prisma.commissionRule.findFirst({ where: { name: r.name } }))) await prisma.commissionRule.create({ data: { ...r } });
  }

  const settings: Record<string, unknown> = {
    company_name: "Celestia Estates",
    whatsapp_number: "",
    min_payout_amount: 10000,
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value: value as never } });
  }

  console.log("Seeded roles, permissions, admin, categories, features, blog categories, commission rules and settings.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
