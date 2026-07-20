"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              Contact & Customer Care
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with Vicky Diagnostics
            </h1>
            <p className="text-slate-600 text-sm">
              Have questions about sample collection, test reports, or booking an appointment? We are here to help 6 days a week.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Contact Details Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Laboratory Location & Direct Contacts
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Center Address</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      101 Diagnostic Towers, Madhapur, Hyderabad, Telangana 500081
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Phone Helpline</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <a href="tel:9398175183" className="text-primary font-bold hover:underline">+91 93981 75183</a>
                    </p>
                    <p className="text-[11px] text-slate-400">Mon - Sat: 6:00 AM to 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">WhatsApp Assistance</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <a href="https://wa.me/919398175183" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">
                        Chat on WhatsApp: +91 93981 75183
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Support Email</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <a href="mailto:support@vickydiagnostics.com" className="text-primary font-bold hover:underline">
                        support@vickydiagnostics.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Map embed */}
              <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-300 relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAiTRAjKnKx43_FyAbcF3_nMLbMz0E2sGE'}&q=Vicky+Diagnostics,Madhapur,Hyderabad,India`}
                ></iframe>
              </div>

            </div>

            {/* Inquiry Form Column */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
              <p className="text-xs text-slate-500">
                Fill out the form below and our customer desk will respond within 2 business hours.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-6 text-center space-y-2">
                  <div className="text-3xl">✅</div>
                  <h3 className="font-bold text-base">Message Sent Successfully!</h3>
                  <p className="text-xs text-emerald-700">
                    Thank you for reaching out to Vicky Diagnostics. Our team will contact you shortly on your provided mobile number.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Home Sample Booking">Home Sample Booking</option>
                      <option value="Report Status Check">Report Status Check</option>
                      <option value="Payment / Billing Issue">Payment / Billing Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Message *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message or test inquiry here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow"
                  >
                    📩 Submit Message
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
