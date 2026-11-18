import prisma from "@/lib/prisma";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function NewProperty() {
  const [categories, features, agents] = await Promise.all([
    prisma.propertyCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.propertyFeature.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: { name: "AGENT" }, status: "ACTIVE" }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <PropertyForm
      categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
      features={features.map((f) => ({ id: f.id.toString(), name: f.name }))}
      agents={agents.map((a) => ({ id: a.id.toString(), name: a.fullName }))}
    />
  );
}
