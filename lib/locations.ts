import prisma from "./prisma";
import { slugify } from "./utils";

/** Finds or creates the Location row for a state/city/(area). Slug is unique per place. */
export async function upsertLocation(loc: { state: string; city: string; area?: string }) {
  const area = loc.area?.trim() || null;
  // Make sure the city-level page (/locations/abuja-fct) exists whenever a neighbourhood is added.
  if (area) {
    const citySlug = slugify(`${loc.city} ${loc.state}`);
    await prisma.location.upsert({ where: { slug: citySlug }, update: {}, create: { state: loc.state.trim(), city: loc.city.trim(), area: null, slug: citySlug } });
  }
  const slug = area ? slugify(`${area} ${loc.city}`) : slugify(`${loc.city} ${loc.state}`);
  return prisma.location.upsert({
    where: { slug },
    update: {},
    create: { state: loc.state.trim(), city: loc.city.trim(), area, slug },
  });
}

export const placeName = (l: { city: string; state: string; area: string | null }) =>
  l.area ? `${l.area}, ${l.city}` : `${l.city}, ${l.state}`;
