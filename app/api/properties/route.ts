import { handle, json } from "@/lib/api";
import { searchProperties } from "@/lib/properties";

// GET /api/properties?listingType=sale&location=Abuja&minPrice=50000000
export const GET = handle(async (req) => {
  return json(await searchProperties(Object.fromEntries(new URL(req.url).searchParams)));
});
