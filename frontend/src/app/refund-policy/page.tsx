import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Refund & Cancellation Policy | Vicky Diagnostics",
  description: "Official Refund and Cancellation Policy for diagnostic test bookings and payments at Vicky Diagnostics.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
              Payment & Refund Guidelines
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refund & Cancellation Policy</h1>
            <p className="text-slate-500 text-sm mt-2">Effective Date: January 1, 2026 | Last Updated: July 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-6">
            <p>
              At <strong>Vicky Diagnostics</strong>, we strive to ensure a transparent, hassle-free diagnostic booking experience. We understand that plans may change. This policy details the terms for cancellation, refunds, and failed online transactions.
            </p>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              1. Appointment Cancellation Guidelines
            </h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
              <p className="font-bold text-sm text-emerald-900">✅ 100% Full Refund Condition:</p>
              <p>
                You are entitled to a full 100% refund if you cancel your home collection appointment or diagnostic test booking at least <strong>2 hours prior</strong> to the scheduled collection time slot.
              </p>
            </div>

            <ul className="list-disc pl-6 space-y-2 pt-2">
              <li>
                <strong>Cancellation before phlebotomist dispatch:</strong> Full refund processed to original payment source.
              </li>
              <li>
                <strong>Cancellation after phlebotomist arrival:</strong> If a phlebotomist has already arrived at your address for home collection, a minimal nominal visiting fee of ₹100 will be deducted, and the remaining amount refunded.
              </li>
              <li>
                <strong>Post sample collection:</strong> Once blood/urine samples have been collected and submitted to the laboratory processing pipeline, cancellations or refunds cannot be accepted.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              2. Refund Processing Timeline
            </h2>
            <p>
              All approved refunds are initiated immediately upon approval and processed through our payment gateway partner, <strong>Razorpay</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UPI payments (GPay, PhonePe, Paytm):</strong> 24 to 48 business hours.</li>
              <li><strong>Credit / Debit Cards & Net Banking:</strong> 5 to 7 business working days depending on your issuing bank.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              3. Failed Transactions & Double Payment Resolution
            </h2>
            <p>
              If your bank account or card was debited for a booking but the booking confirmation failed on our system (or if duplicate payments occurred due to network timeouts):
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Razorpay automatically detects incomplete transactions and auto-refunds the debited amount to your bank account within 3–5 working days.</li>
              <li>You can also contact our billing desk with your payment reference ID to expedite immediate manual verification.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              4. How to Request a Refund or Cancellation
            </h2>
            <p>To request a cancellation or report payment issues, please reach out to our team:</p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1 text-slate-800 font-medium">
              <p className="font-bold text-slate-900">Vicky Diagnostics Refund & Customer Support Desk</p>
              <p>📞 Phone Helpline: +91 93981 75183</p>
              <p>💬 WhatsApp Support: +91 93981 75183</p>
              <p>✉️ Email: <a href="mailto:support@vickydiagnostics.com" className="text-primary hover:underline">support@vickydiagnostics.com</a></p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs">
            <Link href="/terms-and-conditions" className="text-slate-500 hover:text-slate-900 hover:underline">
              ← Terms & Conditions
            </Link>
            <Link href="/shipping-policy" className="text-primary font-bold hover:underline">
              Service Policy →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
