// app/layout.tsx
import "./globals.css";
import SecureNavbar from "@/components/SecureNavbar";
import Providers from "./providers";
import { Suspense } from "react";
import Footer from "@/components/footer";

export const metadata = {
  title: "Electronic Repair Shop Operations",
  description: "A Next.js Forum Application for managing electronic repairs",
  author: "G19 Programs"
};
// app/layout.tsx (or a specific layout)
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600 font-semibold">Loading page...</p>
          </div>
        }></Suspense>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <SecureNavbar />
            <main className="flex-1 p-4">{children}</main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}