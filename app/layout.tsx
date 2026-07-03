import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ads Insight App",
  description: "Upload a CSV or Excel file and get instant AI-powered insights, trends, and metrics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
