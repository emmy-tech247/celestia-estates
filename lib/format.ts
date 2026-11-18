export function formatPrice(price: unknown, currency = "NGN", listingType?: string) {
  const amount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price));
  return listingType === "RENT" ? `${amount}/year` : amount;
}

export const listingLabel = (t: string) => (t === "SALE" ? "For Sale" : t === "RENT" ? "For Rent" : "For Lease");

export const formatDate = (d: Date | string) =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
