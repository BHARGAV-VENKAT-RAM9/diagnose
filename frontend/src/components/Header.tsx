"use client";

import React, { useState } from "react";
import { useTranslation } from "../app/context/TranslationContext";
import Link from "next/link";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-custom bg-white/95 backdrop-blur-md transition-standard">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Vicky <span className="text-primary">Diagnostics</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-primary transition-standard">
            {t("nav.home")}
          </Link>
          <Link href="/booking" className="text-sm font-medium text-slate-600 hover:text-primary transition-standard">
            {t("nav.tests")}
          </Link>
          <Link href="/#packages" className="text-sm font-medium text-slate-600 hover:text-primary transition-standard">
            {t("nav.packages")}
          </Link>
          <Link href="/#contact" className="text-sm font-medium text-slate-600 hover:text-primary transition-standard">
            {t("nav.contact")}
          </Link>
        </nav>

        {/* Actions & Language Selector */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:9398175183"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary hover:text-primary-hover border border-primary/20 rounded-md transition-standard interactive-target bg-primary/5"
          >
            📞 {t("nav.call_now")}
          </a>
        </div>

        {/* Mobile menu button */}
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
        <div className="md:hidden border-t border-border-custom bg-white px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 hover:text-primary py-1"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 hover:text-primary py-1"
            >
              {t("nav.tests")}
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
            <a
              href="tel:9398175183"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-primary border border-primary/20 rounded-md bg-primary/5"
            >
              📞 {t("nav.call_now")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
