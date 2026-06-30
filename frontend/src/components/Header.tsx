"use client";

import React, { useState } from "react";
import { useTranslation } from "../app/context/TranslationContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/booking?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-4 z-50 w-[95%] md:w-[90%] lg:w-[85%] max-w-6xl mx-auto border border-slate-200 bg-white/95 backdrop-blur-md rounded-2xl transition-standard shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-6 gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-black text-xl shadow border border-gold animate-pulse">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline-block">
            Vicky <span className="text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">Diagnostics</span>
          </span>
        </Link>

        {/* Global Search Bar (Apollo/Aarthi style) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xs relative hidden md:block">
          <input
            type="text"
            placeholder="Search tests, scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-semibold"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary cursor-pointer">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-sm font-bold text-slate-800 hover:text-primary transition-standard hover:underline underline-offset-4 decoration-2 decoration-gold">
            {t("nav.home")}
          </Link>
          <Link href="/#packages" className="text-sm font-bold text-slate-800 hover:text-primary transition-standard hover:underline underline-offset-4 decoration-2 decoration-gold">
            {t("nav.packages")}
          </Link>
          <Link href="/#contact" className="text-sm font-bold text-slate-800 hover:text-primary transition-standard hover:underline underline-offset-4 decoration-2 decoration-gold">
            {t("nav.contact")}
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link
            href="/booking"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-900 hover:text-white bg-gold hover:bg-primary border border-gold rounded-lg transition-all duration-300 shadow hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider"
          >
            🧪 Book Test
          </Link>
        </div>

        {/* Mobile menu and search buttons */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-700 focus:outline-none interactive-target"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search tests or scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 hover:text-primary py-1"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 hover:text-primary py-1"
            >
              {t("nav.packages")}
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 hover:text-primary py-1"
            >
              {t("nav.contact")}
            </Link>
          </nav>
          
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-black text-slate-900 bg-gold border-2 border-gold rounded-lg shadow-sm uppercase tracking-wider"
            >
              🧪 Book Test
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
