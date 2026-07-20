import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "About Us | Vicky Diagnostics",
  description: "Learn about Vicky Diagnostics, our mission, medical excellence, state-of-the-art laboratory facility, and patient care commitment.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              About Vicky Diagnostics
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Pioneering Accurate Diagnostics & Patient-Centric Healthcare
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Vicky Diagnostics is a premier diagnostic laboratory center dedicated to bringing precision, speed, and transparency to clinical pathology and preventive healthcare.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-3xl font-black text-primary">500+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Diagnostic Tests</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-3xl font-black text-primary">99.8%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Report Accuracy</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-3xl font-black text-primary">10,000+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Patients Served</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-3xl font-black text-primary">6 Hours</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Avg Report Speed</div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-2xl">🎯</div>
              <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To empower individuals and healthcare providers with fast, reliable, and affordable diagnostic intelligence. We bridge clinical precision with digital convenience through automated sample handling and seamless home collection.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-2xl">🔬</div>
              <h3 className="text-lg font-bold text-slate-900">Laboratory Quality Standard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equipped with fully automated analyzer instruments, bi-directional LIS integration, and rigorous daily internal quality control checks verified by certified senior pathologists.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center">Why Patients Trust Vicky Diagnostics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 border border-slate-200 rounded-xl space-y-2">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                  🩸
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Certified Phlebotomists</h4>
                <p className="text-xs text-slate-500">
                  Trained phlebotomists follow painless blood withdrawal protocols and strict hygienic single-use vacutainer standards.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl space-y-2">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                  📲
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Instant Digital OTP Access</h4>
                <p className="text-xs text-slate-500">
                  Download reports securely via WhatsApp and web OTP without waiting in line at the diagnostic lab.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl space-y-2">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                  🌐
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Bilingual Report & Portal</h4>
                <p className="text-xs text-slate-500">
                  Supporting English and Telugu for better health literacy and accessibility across all patient demographics.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-slate-900 rounded-2xl p-8 text-center text-white space-y-4">
            <h3 className="text-xl font-bold">Ready to Book Your Diagnostic Test?</h3>
            <p className="text-slate-400 text-xs max-w-xl mx-auto">
              Schedule home sample collection or visit our center in Madhapur today.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link href="/booking" className="px-6 py-2.5 bg-gold text-slate-900 font-bold text-sm rounded-lg hover:bg-yellow-400 transition-colors uppercase tracking-wider">
                🧪 Book Test Now
              </Link>
              <Link href="/contact" className="px-6 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-700 transition-colors">
                Contact Desk
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
