import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "./context/TranslationContext";
import { CartProvider } from "./context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vicky Diagnostics - Accurate Diagnostic Testing, Fast & Reliable Reports",
  description: "Book blood tests and clinical health packages online. Home collection available. Digital OTP report downloads, Telugu & English bilingual support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <TranslationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
