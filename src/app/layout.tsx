import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockDNA — Tokenized Equities Explorer | RWA Lens",
  description:
    "Explore, verify, and compare tokenized stock representations on BNB Smart Chain across Ondo, bStocks, and xStocks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
