"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "../../../components/Header";
import { useTranslation } from "../../context/TranslationContext";
import { useCart } from "../../context/CartContext";
import localTests from "../../data/local_tests.json";

const LOCAL_TESTS = localTests;

const LOCAL_PACKAGES = [
  {
    id: "p1",
    name: "Comprehensive Health Package",
    slug: "comprehensive-health-package",
    price: 1397,
    discount_price: 1199,
    tests: ["t1", "t3", "t4"],
    description: "Full body panel containing Complete Blood Count, Liver Function Test, and Thyroid Profile at a bundle discount."
  }
];

const generatePackageDetails = (pkg: any, testsList: any[]) => {
  if (!pkg) return null;
  const name = (pkg.name || "").toUpperCase();
  const description = pkg.description || `Comprehensive wellness screening bundle. Includes multiple blood, urine, or radiology tests at a bundle discount.`;

  // Find all tests in the package
  const pkgTestIds = pkg.tests ? pkg.tests.map((pt: any) => {
    if (typeof pt === 'string') return pt;
    return pt.id || pt.slug;
  }) : [];

  const pkgTests = testsList.filter(t => 
    pkgTestIds.some((idOrSlug: string) => 
      t.id === idOrSlug || 
      t.slug === idOrSlug || 
      t.name.toLowerCase() === idOrSlug.toLowerCase() ||
      (idOrSlug === "t1" && t.slug === "cbc") ||
      (idOrSlug === "t2" && t.slug === "vitamin-d") ||
      (idOrSlug === "t3" && t.slug === "thyroid-profile") ||
      (idOrSlug === "t4" && t.slug === "lft")
    )
  );

  // Determine preparation from tests
  let preparation = "No special preparation required.";
  let requiresFasting = false;
  pkgTests.forEach(t => {
    const prepUpper = (t.preparation || "").toUpperCase();
    if (prepUpper.includes("FASTING") || prepUpper.includes("FAST")) {
      requiresFasting = true;
    }
  });

  if (requiresFasting) {
    preparation = "⚠️ Fasting required: Fast strictly for 10-12 hours before sample collection. Only plain water is allowed during fasting.";
  }

  // Determine dynamic details
  let whyTake = "This health package offers a holistic evaluation of multiple vital organ systems, helping to catch asymptomatic abnormalities early, establish diagnostic baselines, and review general health status.";
  let dos = [
    "Stay hydrated by drinking normal amounts of water before sample collection.",
    "Wear loose, comfortable clothing to facilitate quick blood draw or diagnostic testing.",
    "Disclose any ongoing prescription medications or supplements to the technician."
  ];
  let donts = [
    "Avoid consuming alcohol, heavy meals, or highly fatty foods for 24-48 hours before testing.",
    "Do not smoke or engage in high-intensity exercise on the morning of sample collection."
  ];

  if (name.includes("WOMEN")) {
    whyTake = "Tailored specifically to check bone health, blood indices (anemia screening), metabolic status, thyroid performance, and vitamin markers for female physiology.";
    dos.push("Prefer taking the test in the morning to capture stable hormone and metabolic baselines.");
  } else if (name.includes("SENIOR") || name.includes("CITIZEN") || name.includes("GERIATRIC")) {
    whyTake = "Designed for older adults to monitor kidney filtration, liver health, blood lipids, cardiac status (ECG), thyroid speeds, and essential vitamins (B12, D).";
    dos.push("Ensure senior patients are accompanied if they have mobility limitations.");
    donts.push("Avoid heavy salt or high sugar intake for 24 hours prior to the test.");
  } else if (name.includes("HEART") || name.includes("CARDIAC")) {
    whyTake = "Evaluates lipid profiles, cardiac inflammatory markers (like CRP), ECG activity, and organ functions to assess general cardiovascular risks.";
    dos.push("Wear clothing with buttons that are easy to adjust/open for ECG lead placement.");
    donts.push("Avoid caffeinated beverages, tea, energy drinks, or nicotine for at least 2 hours before the ECG.");
  } else if (name.includes("DIABETES") || name.includes("GLUCOSE")) {
    whyTake = "Evaluates blood sugar, HbA1c (3-month control), urine glucose, and kidney filters to comprehensively assess prediabetes, diabetes, and related metabolic impacts.";
    if (requiresFasting) {
      donts.push("Avoid having coffee, tea, juices, or chewing gum during the fasting duration.");
    }
  } else if (name.includes("THYROID")) {
    whyTake = "Comprehensive evaluation of thyroid gland speeds (T3, T4, and TSH) to screen for hyperthyroidism and hypothyroidism.";
    donts.push("Do not take thyroid hormone replacement drugs before blood draw; take them afterwards.");
  }

  return {
    description,
    preparation,
    whyTake,
    dos,
    donts,
    includedTests: pkgTests
  };
};

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, addToCart, removeFromCart } = useCart();
  
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const details = generatePackageDetails(pkg, LOCAL_TESTS);

  const slug = params?.slug as string;

  const findLocalFallback = () => {
    const fallback = LOCAL_PACKAGES.find(p => p.slug === slug);
    if (fallback) {
      setPkg(fallback);
    } else {
      setError("Health package not found in our diagnostic directory.");
    }
  };

  const fetchPackageDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/catalog/packages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        // Extract test ids or tests array
        const testsMapped = data.tests ? data.tests.map((t: any) => t.id) : [];
        setPkg({
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: Number(data.price),
          discount_price: data.discount_price ? Number(data.discount_price) : null,
          tests: testsMapped,
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
      fetchPackageDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Retrieving package details...</p>
        </main>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800">Package Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm">{error || "The requested health package details could not be retrieved."}</p>
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

  const inCart = cart.find(c => c.id === pkg.id);
  const savings = pkg.discount_price ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100) : 0;

  // Resolve included tests details from local fallback database
  const includedTestsList = LOCAL_TESTS.filter(t => pkg.tests.includes(t.id));

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
              src="/doctor_and_patient.png" 
              alt="Doctor and Patient" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
              Recommended Health Package
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {pkg.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {pkg.description}
            </p>
          </div>

          {/* Included Tests List */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Included Diagnostic Tests ({includedTestsList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includedTestsList.map(test => (
                <div key={test.id} className="border border-slate-200 rounded-lg p-3 hover:border-primary transition-standard bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{test.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Fasting / prep guidelines apply</p>
                  </div>
                  <Link
                    href={`/tests/${test.slug}`}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing and Cart operations */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-5 rounded-lg border border-slate-100">
            <div className="space-y-1 text-center sm:text-left">
              {pkg.discount_price ? (
                <>
                  <span className="text-xs text-slate-400 line-through">₹{pkg.price}</span>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <p className="text-3xl font-extrabold text-slate-900">₹{pkg.discount_price}</p>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Save {savings}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Package Price</span>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono">₹{pkg.price}</p>
                </>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => inCart ? removeFromCart(pkg.id) : addToCart({ ...pkg, type: "package" })}
                className={`flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-md transition-standard ${
                  inCart 
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                    : "bg-accent text-white hover:bg-accent-hover shadow-sm"
                }`}
              >
                {inCart ? "Remove Package" : "Book Health Package"}
              </button>
              {inCart && (
                <button
                  onClick={() => router.push("/booking")}
                  className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white hover:bg-primary-hover text-sm font-bold rounded-md shadow-sm transition-standard"
                >
                  Configure Slot &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Clinical Guidelines and Prep details */}
          {details && (
            <div className="space-y-6 pt-6 border-t border-slate-100">
              {/* Preparation */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋</span> Preparation Required
                </h3>
                <p className="text-xs text-amber-800 font-medium leading-relaxed bg-amber-50/70 p-3 rounded-lg border border-amber-100">
                  {details.preparation}
                </p>
              </div>

              {/* Why Take This Test */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💡</span> Why Should You Book This Package?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  {details.whyTake}
                </p>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Dos */}
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-4 space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                    <span className="text-emerald-500">✅</span> Do's Before Test
                  </h4>
                  <ul className="list-none space-y-2 text-xs text-slate-600 pl-1">
                    {details.dos.map((item, idx) => (
                      <li key={idx} className="relative pl-4 leading-normal">
                        <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div className="bg-rose-50/30 border border-rose-100 rounded-lg p-4 space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wide flex items-center gap-1">
                    <span className="text-rose-500">❌</span> Don'ts Before Test
                  </h4>
                  <ul className="list-none space-y-2 text-xs text-slate-600 pl-1">
                    {details.donts.map((item, idx) => (
                      <li key={idx} className="relative pl-4 leading-normal">
                        <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
      </main>
    </div>
  );
}
