import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TickerKin — Trace Tokenized Equities on BNB Chain",
  description:
    "Trace an equity across its verified tokenized representations on BNB Smart Chain. Powered by RWA Lens normalization engine.",
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
