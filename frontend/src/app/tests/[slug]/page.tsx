"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { useTranslation } from "../../context/TranslationContext";
import { useCart } from "../../context/CartContext";
import localTests from "../../data/local_tests.json";

const LOCAL_TESTS = localTests;

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { cart, addToCart, removeFromCart } = useCart();
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const slug = params?.slug as string;

  const findLocalFallback = () => {
    const fallback = LOCAL_TESTS.find(t => t.slug === slug);
    if (fallback) {
      setTest(fallback);
    } else {
      setError("Clinical test not found in our diagnostic directory.");
    }
  };

  const fetchTestDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + ""}/api/v1/catalog/tests/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTest({
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: Number(data.price),
          tat: data.tat,
          sample_type: data.sample_type,
          priority: data.priority,
          preparation: data.preparation_required || "No special preparation required.",
          home_collection: data.home_collection_available,
          description: data.description
        });
      } else {
        findLocalFallback();
      }
    } catch (err) {
      findLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchTestDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Retrieving test details...</p>
        </main>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800">Test Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm">{error || "The requested diagnostic test details could not be retrieved."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary-hover transition-standard"
          >
            Back to Directory
          </button>
        </main>
      </div>
    );
  }

  const inCart = cart.find(c => c.id === test.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <button
          onClick={() => router.push("/")}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          &larr; Back to Diagnostics Directory
        </button>

        <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="relative h-48 w-full">
            <img 
              src="/lab_equipment.png" 
              alt="Laboratory Equipment" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
              {test.sample_type} test
            </span>
            {test.priority === "URGENT" && (
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                STAT / Urgent Available
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {test.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {test.description}
            </p>
          </div>

          {/* Fasting and Prep Instruction box */}
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              ⚠️ Preparation Instructions
            </h4>
            <p className="text-xs leading-relaxed font-semibold">
              {test.preparation.toLowerCase().includes("fasting") 
                ? `${test.preparation} ${t("clinical_prep.fasting_required") || ""}`
                : test.preparation}
            </p>
          </div>

          {/* Details Slabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 text-xs text-slate-600">
            <div>
              <p className="text-slate-400 font-medium">🕒 Expected TAT</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{test.tat}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">🧪 Specimen Type</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{test.sample_type}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">🏠 Home Collection</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {test.home_collection ? "Available at Centre or Home" : "Centre Visit Only"}
              </p>
            </div>
          </div>

          {/* Price and Checkout block */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-lg">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Test Price</span>
              <p className="text-3xl font-extrabold text-slate-900">₹{test.price}</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => inCart ? removeFromCart(test.id) : addToCart({ ...test, type: "test" })}
                className={`flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-md transition-standard ${
                  inCart 
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                    : "bg-primary text-white hover:bg-primary-hover shadow-sm"
                }`}
              >
                {inCart ? "Remove from Cart" : "Book This Test"}
              </button>
              {inCart && (
                <button
                  onClick={() => router.push("/booking")}
                  className="flex-1 sm:flex-none px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-md shadow-sm transition-standard"
                >
                  Configure Slot &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
      </main>
    </div>
  );
}
