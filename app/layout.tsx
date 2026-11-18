import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Celestia Estates", template: "%s | Celestia Estates" },
  description: "Premium properties for sale and rent across Nigeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
