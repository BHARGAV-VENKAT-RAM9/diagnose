import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions | Vicky Diagnostics",
  description: "Terms and Conditions governing the use of diagnostic services, appointment bookings, and online payments at Vicky Diagnostics.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
              Legal Agreement
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
            <p className="text-slate-500 text-sm mt-2">Effective Date: January 1, 2026 | Last Updated: July 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-6">
            <p>
              Welcome to <strong>Vicky Diagnostics</strong>. By accessing our website, booking diagnostic tests, or utilizing our home sample collection services, you agree to be bound by the following Terms & Conditions. Please read them carefully before scheduling an appointment or making a payment.
            </p>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              1. Services Provided
            </h2>
            <p>
              Vicky Diagnostics provides clinical laboratory testing, health checkup packages, and home sample collection services. Diagnostic tests are processed using certified lab equipment and verified by qualified pathology professionals.
            </p>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              2. Appointment Booking & Fasting Instructions
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Patients are responsible for providing accurate personal details, contact numbers, and home addresses during booking.</li>
              <li>Certain diagnostic tests (e.g., Fasting Blood Sugar, Lipid Profile) require strict fasting (8 to 12 hours). Patients are advised to adhere strictly to pre-test preparation instructions provided on our portal.</li>
              <li>Vicky Diagnostics reserves the right to reschedule sample collection if pre-test fasting requirements are not fulfilled.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              3. Online Payments & Billing
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payments made through our website are securely processed via <strong>Razorpay</strong> payment gateway supporting UPI, Credit/Debit Cards, Net Banking, and digital wallets.</li>
              <li>Prices listed on the portal are inclusive of applicable taxes unless stated otherwise.</li>
              <li>Pay on Delivery / Pay at Collection options are also available for eligible test packages.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              4. Medical Disclaimer
            </h2>
            <p>
              Diagnostic test reports issued by Vicky Diagnostics are for informational and clinical reference purposes. Test results must be interpreted by a registered medical practitioner in conjunction with clinical symptoms. Laboratory reports alone do not constitute medical advice or a definitive diagnosis.
            </p>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              5. Intellectual Property & Portal Conduct
            </h2>
            <p>
              All website content, logos, branding, and report formats are the exclusive property of Vicky Diagnostics. Users agree not to misuse the website, attempt unauthorized database access, or submit fraudulent bookings.
            </p>

            <h2 className="text-lg font-bold text-slate-900 pt-2 border-b border-slate-100 pb-2">
              6. Contact & Support
            </h2>
            <p>For any queries regarding terms of service, please contact us at:</p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1 text-slate-800 font-medium">
              <p className="font-bold text-slate-900">Vicky Diagnostics Customer Service</p>
              <p>📞 Phone: +91 93981 75183</p>
              <p>✉️ Email: <a href="mailto:support@vickydiagnostics.com" className="text-primary hover:underline">support@vickydiagnostics.com</a></p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs">
            <Link href="/privacy-policy" className="text-slate-500 hover:text-slate-900 hover:underline">
              ← Privacy Policy
            </Link>
            <Link href="/refund-policy" className="text-primary font-bold hover:underline">
              Refund Policy →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
