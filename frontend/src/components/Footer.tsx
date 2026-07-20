"use client";

import React from "react";
import Link from "next/link";

interface FooterProps {
  onOpenAdminPortal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminPortal }) => {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Column 1: Brand & Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-black text-lg shadow border border-gold">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Vicky <span className="text-gold">Diagnostics</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Digitizing diagnostic healthcare with medical excellence. Providing certified lab testing, instant digital report access, and convenient home sample collection.
          </p>
          <p className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
            Vicky Diagnostics is a registered diagnostic laboratory center.
          </p>
          {onOpenAdminPortal && (
            <div className="pt-1">
              <button
                onClick={onOpenAdminPortal}
                className="text-xs text-slate-400 hover:text-white underline transition-colors"
              >
                🔬 Staff Portal (Admin / Technician View)
              </button>
            </div>
          )}
        </div>

        {/* Column 2: Quick Links & Company */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Company & Services</h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                🏠 Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                🏢 About Us
              </Link>
            </li>
            <li>
              <Link href="/booking" className="hover:text-white transition-colors">
                🧪 Book Diagnostic Tests
              </Link>
            </li>
            <li>
              <Link href="/#packages" className="hover:text-white transition-colors">
                🩺 Health Packages
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                📞 Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Mandatory Legal & Policy Links (Razorpay Required) */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Policies & Legal</h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                🔒 Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                📜 Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-white transition-colors">
                💳 Refund & Cancellation Policy
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">
                🚚 Home Sample & Report Delivery Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Operating Hours */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Contact & Schedule</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <span>📍</span>
              <span>101 Diagnostic Towers, Madhapur, Hyderabad, Telangana 500081</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <a href="tel:9398175183" className="hover:text-white transition-colors">
                +91 93981 75183
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span>💬</span>
              <a href="https://wa.me/919398175183" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                WhatsApp: +91 93981 75183
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span>✉️</span>
              <a href="mailto:support@vickydiagnostics.com" className="hover:text-white transition-colors">
                support@vickydiagnostics.com
              </a>
            </li>
          </ul>
          <div className="pt-2 border-t border-slate-800 text-xs">
            <p className="font-semibold text-slate-300">Center Schedule:</p>
            <p className="text-slate-400">Mon - Sat: 6:00 AM - 6:00 PM</p>
            <p className="text-slate-500">Sunday: Emergency Home Collection Only</p>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>&copy; {new Date().getFullYear()} Vicky Diagnostics. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy-policy" className="hover:text-slate-400">Privacy</Link>
          <span>•</span>
          <Link href="/terms-and-conditions" className="hover:text-slate-400">Terms</Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-slate-400">Refunds</Link>
          <span>•</span>
          <Link href="/shipping-policy" className="hover:text-slate-400">Service Policy</Link>
        </div>
      </div>
    </footer>
  );
};
