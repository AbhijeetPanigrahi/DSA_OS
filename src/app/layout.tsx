import type { Metadata } from "next";
import { PRODUCT_CONFIG } from "@/config/product";
import "./globals.css";

export const metadata: Metadata = {
  title: `${PRODUCT_CONFIG.name} — ${PRODUCT_CONFIG.subtitle}`,
  description: PRODUCT_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-dsa-text antialiased">
        {children}
      </body>
    </html>
  );
}
