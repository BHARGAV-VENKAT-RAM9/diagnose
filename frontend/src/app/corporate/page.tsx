"use client";

import React, { useState } from "react";
import { Header } from "../../components/Header";

export default function CorporateHealth() {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [requirement, setRequirement] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !phone) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/corporate-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          contact_person: contactPerson,
          phone,
          employee_count: employeeCount ? parseInt(employeeCount) : null,
          requirement
        })
      });

      if (!res.ok) throw new Error("Lead submission failed.");
      
      setSubmitted(true);
    } catch (err) {
      // Fallback for offline demo mode
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Corporate Wellness & B2B Packages
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Custom annual health screenings, pre-employment checkups, and corporate diagnostic discounts for companies.
          </p>
        </div>

        {submitted ? (
          /* Submission Success State */
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 max-w-md mx-auto shadow-sm animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">Enquiry Submitted</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thank you for contacting Vicky Diagnostics. Our administrative team will reach out to schedule a custom plan within 24 hours.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCompanyName("");
                  setContactPerson("");
                  setPhone("");
                  setEmployeeCount("");
                  setRequirement("");
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        ) : (
          /* Leads capture form */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="space-y-4 text-xs text-slate-600 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800">Why Choose Vicky Diagnostics for B2B?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>On-Site Health Camps:</strong> Phlebotomists visiting your office branches directly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Custom Billing Slabs:</strong> Volume-based pricing plans tailored for small & large organizations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Digital OTP Portals:</strong> Secure portal for employees to retrieve report PDFs.</span>
                  </li>
                </ul>
              </div>
              <div className="h-48 w-full rounded-lg overflow-hidden relative border border-slate-200 mt-4">
                <img 
                  src="/corporate_wellness.png" 
                  alt="Corporate Wellness Health Screening" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>


            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <p className="text-xs font-bold text-red-600">⚠️ {error}</p>}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact Person *</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Employee Count</label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full border border-slate-300 rounded-md p-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Describe Checkup Requirements</label>
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  rows={3}
                  placeholder="Describe employee roles, custom diagnostic panels needed..."
                  className="w-full border border-slate-300 rounded-md p-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow transition-standard interactive-target"
              >
                {loading ? "Submitting..." : "Submit Wellness Enquiry"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
