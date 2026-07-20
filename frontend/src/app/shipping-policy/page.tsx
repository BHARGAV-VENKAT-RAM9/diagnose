import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Service & Sample Delivery Policy | Vicky Diagnostics",
  description: "Fulfillment, Home Sample Collection, and Digital Report Delivery Policy for Vicky Diagnostics.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
              Service Fulfillment & Delivery
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Home Sample & Report Delivery Policy</h1>
            <p className="text-slate-500 text-sm mt-2">Effective Date: January 1, 2026 | Last Updated: July 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-6">
            <p>
              As a certified medical laboratory center, <strong>Vicky Diagnostics</strong> provides diagnostic testing services through two primary fulfillment channels: <strong>Home Sample Collection</strong> by certified phlebotomists and <strong>Online Digital Report Delivery</strong>.
            </p>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              1. Home Sample Collection Service
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Availability:</strong> Home sample collection is available across Hyderabad and surrounding regions (including Madhapur, Gachibowli, HITECH City, Jubilee Hills, Kondapur, and nearby areas).
              </li>
              <li>
                <strong>Collection Time Slots:</strong> Phlebotomists operate daily between <strong>6:00 AM and 5:00 PM</strong>. Samples are collected within a 30-to-60 minute window of your selected appointment slot.
              </li>
              <li>
                <strong>Safety & Cold-Chain Transport:</strong> All blood, urine, and diagnostic samples are collected using vacuum blood tubes (BD Vacutainer) and transported in temperature-monitored cold chain collection bags to maintain specimen integrity.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              2. Digital Report Delivery Timeline
            </h2>
            <p>
              Once samples arrive at our central laboratory and complete pathology quality checks, reports are generated and delivered digitally:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <p className="font-bold text-slate-900 text-sm">⚡ Routine Blood & Urine Tests</p>
                <p className="text-xs text-slate-600">CBC, Blood Sugar, HbA1c, Lipid Profile, Thyroid Profile</p>
                <p className="text-xs font-bold text-primary pt-1">Delivered within 6 to 12 Hours</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <p className="font-bold text-slate-900 text-sm">🔬 Specialized & Culture Tests</p>
                <p className="text-xs text-slate-600">Vitamin D/B12, Blood Culture, Histopathology, Special Hormones</p>
                <p className="text-xs font-bold text-primary pt-1">Delivered within 24 to 48 Hours</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              3. Report Delivery Channels
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Secure Online Portal:</strong> Access and download encrypted PDF reports anytime using your registered phone number and OTP.</li>
              <li><strong>WhatsApp & SMS Alerts:</strong> Automated notification links sent immediately upon report authorization by our pathologist.</li>
              <li><strong>Hard Copy Delivery:</strong> Physical printed reports with official doctor signatures can be collected from our center or requested for courier dispatch upon request.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              4. Service Inquiries & Support
            </h2>
            <p>For questions regarding sample collection status or report delivery, contact our dispatch desk:</p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1 text-slate-800 font-medium">
              <p className="font-bold text-slate-900">Vicky Diagnostics Logistics & Dispatch Support</p>
              <p>📍 101 Diagnostic Towers, Madhapur, Hyderabad, Telangana 500081</p>
              <p>📞 Phone: +91 93981 75183</p>
              <p>✉️ Email: <a href="mailto:support@vickydiagnostics.com" className="text-primary hover:underline">support@vickydiagnostics.com</a></p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs">
            <Link href="/refund-policy" className="text-slate-500 hover:text-slate-900 hover:underline">
              ← Refund Policy
            </Link>
            <Link href="/about" className="text-primary font-bold hover:underline">
              About Us →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
