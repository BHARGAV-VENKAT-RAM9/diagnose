"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "./context/TranslationContext";
import { useCart } from "./context/CartContext";
import { Header } from "../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Default clinical database seeded for offline/interactive availability
const LOCAL_TESTS = [
  {
    id: "t1",
    name: "Complete Blood Count (CBC)",
    slug: "cbc",
    price: 299,
    tat: "12 Hours",
    sample_type: "Blood",
    priority: "ROUTINE",
    preparation: "No special preparation required.",
    home_collection: true,
    home_notes: "Avoid heavy meals just before.",
    description: "Evaluates overall health and detects anemia, infection, and leukemia."
  },
  {
    id: "t2",
    name: "Vitamin D (25-Hydroxy)",
    slug: "vitamin-d",
    price: 999,
    tat: "24 Hours",
    sample_type: "Blood",
    priority: "ROUTINE",
    preparation: "10-12 hours fasting is recommended.",
    home_collection: true,
    home_notes: "Drink plenty of water before collection.",
    description: "Measures Vitamin D concentration to identify bone and metabolism deficiencies."
  },
  {
    id: "t3",
    name: "Thyroid Profile (T3, T4, TSH)",
    slug: "thyroid-profile",
    price: 599,
    tat: "12 Hours",
    sample_type: "Blood",
    priority: "ROUTINE",
    preparation: "Morning sample preferred. Fasting optional.",
    home_collection: true,
    home_notes: "Collect early morning before taking thyroid medications.",
    description: "Assesses thyroid gland function to evaluate metabolic speed and energy."
  },
  {
    id: "t4",
    name: "Liver Function Test (LFT)",
    slug: "lft",
    price: 499,
    tat: "12 Hours",
    sample_type: "Blood",
    priority: "ROUTINE",
    preparation: "Fasting of 8-10 hours is mandatory.",
    home_collection: true,
    home_notes: "Avoid alcohol 24 hours prior to collection.",
    description: "Measures proteins, enzymes, and bilirubin to screen for liver disorders."
  }
];

const LOCAL_PACKAGES = [
  {
    id: "p1",
    name: "Comprehensive Health Package",
    slug: "comprehensive-health-package",
    price: 1397,
    discount_price: 1199,
    tests: ["t1", "t3", "t4"],
    description: "Full body panel containing Complete Blood Count, Liver Function Test, and Thyroid Profile at a bundle discount."
  },
  {
    id: "p2",
    name: "Basic Health Checkup",
    slug: "basic-health-checkup",
    price: 1499,
    discount_price: 999,
    tests: ["t1", "glucose-fasting-fbs", "glycosylated-hba1c", "lipid-profile", "lft", "renal-profilerft-or-kft", "urine-complete-analysis-cue-urine", "tsh-thyroid-stimulating-hormone-ultra"],
    description: "Essential screening package evaluating overall health, blood sugar, lipid levels, thyroid, liver, and kidney function."
  },
  {
    id: "p3",
    name: "Diabetes Profile",
    slug: "diabetes-profile",
    price: 1999,
    discount_price: 1499,
    tests: ["glycosylated-hba1c", "glucose-fasting-fbs", "glucose-post-lunch", "urine-glucose-r", "micro-albumin-urine", "renal-profilerft-or-kft", "lipid-profile"],
    description: "Comprehensive panel for monitoring and diagnosing blood sugar levels, long-term glycemic control, and secondary diabetic implications on kidneys and lipids."
  },
  {
    id: "p4",
    name: "Thyroid Profile",
    slug: "thyroid-profile-package",
    price: 999,
    discount_price: 799,
    tests: ["t3", "t4", "tsh", "free-t3-triiodothyronine-free-t3", "free-t4-thyroxine-free", "tsh-thyroid-stimulating-hormone-ultra", "total-t4-thyroxine-t4", "thyroid-profile"],
    description: "Evaluates thyroid gland activity. Includes free and total thyroid hormones to screen for hyperthyroidism and hypothyroidism."
  },
  {
    id: "p5",
    name: "Heart Health Package",
    slug: "heart-health-package",
    price: 2499,
    discount_price: 1999,
    tests: ["t1", "lipid-profile", "digital-ecg", "crp-c-reactive-protein", "glucose-fasting-fbs", "lft", "renal-profilerft-or-kft"],
    description: "Cardiovascular screening package including lipid analysis, cardiac inflammatory marker (CRP), ECG, glucose, and metabolic status."
  },
  {
    id: "p6",
    name: "Women's Health Package",
    slug: "womens-health-package",
    price: 2999,
    discount_price: 2499,
    tests: ["t1", "glycosylated-hba1c", "lipid-profile", "thyroid-profile", "vitamin-d", "vitamin-b12-active-holotranscobalamin", "calcium", "iron-studies", "urine-complete-analysis-cue-urine"],
    description: "Specifically designed checkup for women, focusing on bone health, anemia, vitamins, thyroid function, and diabetic screening."
  },
  {
    id: "p7",
    name: "Senior Citizen Health Package",
    slug: "senior-citizen-health-package",
    price: 4499,
    discount_price: 3499,
    tests: ["t1", "glycosylated-hba1c", "glucose-fasting-fbs", "lipid-profile", "lft", "renal-profilerft-or-kft", "vitamin-d", "vitamin-b12-active-holotranscobalamin", "thyroid-profile", "digital-ecg", "urine-complete-analysis-cue-urine"],
    description: "Full body geriatric screening panel covering critical parameters for elder care including cardiac, kidney, liver, vitamins, and metabolic functions."
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

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();

  // Dynamic catalog state
  const [tests, setTests] = useState<any[]>(LOCAL_TESTS);
  const [packages, setPackages] = useState<any[]>(LOCAL_PACKAGES);

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activePackageDetails, setActivePackageDetails] = useState<any>(null);

  useEffect(() => {
    if (packages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % packages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [packages.length]);

  // Cart & Booking Flow Actions
  const { addToCart } = useCart();

  // Report Portal States
  const [showReportPortal, setShowReportPortal] = useState(false);
  const [portalPhone, setPortalPhone] = useState("");
  const [portalOtp, setPortalOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLockoutTime, setOtpLockoutTime] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [otpSentCode, setOtpSentCode] = useState(""); // Holds generated otp for mock visual
  const [otpVerified, setOtpVerified] = useState(false);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  // Reviews dynamic loading and submission
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ patientName: "", rating: 5, reviewText: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");

  const DEFAULT_REVIEWS = [
    { id: "def-1", patient_name: "Ramesh K.", rating: 5, review_text: "Extremely fast reports! I booked the slot in under 2 minutes, and got the PDF on WhatsApp the next day. High care shown." },
    { id: "def-2", patient_name: "Sireesha M.", rating: 5, review_text: "The Home Collection was flawless. Phlebotomist arrived exactly on time, checked my verification OTP, and was very professional. Highly recommended!" },
    { id: "def-3", patient_name: "Bhargav V.", rating: 5, review_text: "The online booking platform is excellent. The instructions are very clear, ensuring I fasted correctly for LFT. Very trustworthy." }
  ];

  const mappedTestimonials = approvedReviews.map((rev, index) => {
    const avatarUrls = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    ];
    return {
      id: index + 1,
      name: rev.patient_name || rev.name || "Anonymous Patient",
      role: "Verified Patient",
      company: "Vicky Diagnostics",
      content: rev.review_text || rev.text || "",
      rating: rev.rating || 5,
      avatar: avatarUrls[index % avatarUrls.length]
    };
  });

  const fetchCatalog = async () => {
    try {
      const testsRes = await fetch("http://localhost:8000/api/v1/catalog/tests");
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        if (testsData && testsData.length > 0) {
          setTests(testsData);
        }
      }
      const pkgsRes = await fetch("http://localhost:8000/api/v1/catalog/packages");
      if (pkgsRes.ok) {
        const pkgsData = await pkgsRes.json();
        if (pkgsData && pkgsData.length > 0) {
          setPackages(pkgsData);
        }
      }
    } catch (err) {
      console.log("Using local fallbacks for catalog:", err);
    }
  };

  const fetchApprovedReviews = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/reviews/approved");
      if (res.ok) {
        const data = await res.json();
        setApprovedReviews(data.length > 0 ? data : DEFAULT_REVIEWS);
      } else {
        setApprovedReviews(DEFAULT_REVIEWS);
      }
    } catch (err) {
      setApprovedReviews(DEFAULT_REVIEWS);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchApprovedReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.patientName.trim()) {
      setReviewSubmitError("Please enter your name.");
      return;
    }
    setSubmittingReview(true);
    setReviewSubmitError("");
    setReviewSubmitMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: newReview.patientName,
          rating: newReview.rating,
          review_text: newReview.reviewText
        })
      });
      if (res.ok) {
        setReviewSubmitMessage("Thank you for your feedback!");
        setNewReview({ patientName: "", rating: 5, reviewText: "" });
        fetchApprovedReviews();
      } else {
        const errData = await res.json();
        setReviewSubmitError(errData.detail || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      setReviewSubmitError("Network error. Please try again later.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchAdminBookings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/bookings");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((b: any) => ({
          id: b.id,
          patient: b.patient_name || "Unknown",
          phone: b.phone || "N/A",
          tests: b.tests || [],
          type: b.booking_type === "HOME_COLLECTION" ? "Home Collection" : "Lab Visit",
          status: b.status,
          slot: b.slot_time.replace("T", " ").substring(0, 16),
          report_uploaded: b.status === "REPORT_UPLOADED" || b.status === "COMPLETED",
          critical: b.report?.critical_value_flag || false
        }));
        setAdminBookings(formatted);
      }
    } catch (err) {
      console.log("Error loading admin bookings:", err);
    }
  };

  const [pendingReviews, setPendingReviews] = useState<any[]>([]);

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/reviews/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingReviews(data);
      }
    } catch (err) {
      console.log("Error fetching pending reviews:", err);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      const loginRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin" })
      });
      if (!loginRes.ok) {
        alert("Failed to authenticate as Admin.");
        return;
      }
      const loginData = await loginRes.json();
      const adminUserId = loginData.user_id;

      const approveRes = await fetch(`http://localhost:8000/api/v1/admin/reviews/approve/${reviewId}?admin_user_id=${adminUserId}`, {
        method: "POST"
      });
      if (approveRes.ok) {
        alert("Review approved successfully! It will now appear on the homepage.");
        fetchPendingReviews();
        fetchApprovedReviews();
      } else {
        const err = await approveRes.json();
        alert("Failed to approve review: " + (err.detail || "Unknown error"));
      }
    } catch (err) {
      console.log("Error approving review:", err);
      alert("Network error approving review.");
    }
  };

  useEffect(() => {
    fetchAdminBookings();
    fetchPendingReviews();
  }, []);

  // Admin Pipeline Simulation States
  const [showAdminPipeline, setShowAdminPipeline] = useState(false);

  useEffect(() => {
    if (showAdminPipeline) {
      fetchAdminBookings();
      fetchPendingReviews();
    }
  }, [showAdminPipeline]);
  const [adminBookings, setAdminBookings] = useState<any[]>([
    {
      id: "b-101",
      patient: "Rajesh Kumar",
      phone: "9398175183",
      tests: ["Complete Blood Count (CBC)"],
      type: "Home Collection",
      status: "Confirmed",
      slot: "2026-06-20 08:00",
      report_uploaded: false,
      critical: false
    },
    {
      id: "b-102",
      patient: "Saraswathi Devi",
      phone: "9123456789",
      tests: ["Thyroid Profile (T3, T4, TSH)"],
      type: "Lab Visit",
      status: "Sample Collected",
      slot: "2026-06-19 10:00",
      report_uploaded: false,
      critical: false
    }
  ]);

  // Lockout Timer Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpLockoutTime) {
      const interval = () => {
        const remaining = Math.max(0, Math.ceil((otpLockoutTime! - Date.now()) / 1000));
        setLockoutCountdown(remaining);
        if (remaining <= 0) {
          setOtpLockoutTime(null);
          setOtpAttempts(0);
        }
      };
      interval();
      timer = setInterval(interval, 1000);
    }
    return () => clearInterval(timer);
  }, [otpLockoutTime]);

  // OTP Verification Simulation
  const handleRequestOtp = async () => {
    if (otpLockoutTime) return;
    
    if (portalPhone.length < 10) {
      setOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setOtpError("");
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/request-otp?phone=${portalPhone}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setOtpSent(true);
        setOtpSentCode(data.otp || `${Math.floor(100000 + Math.random() * 900000)}`);
      } else {
        const data = await res.json();
        setOtpError(data.detail || "Failed to send OTP.");
      }
    } catch (err) {
      console.log("Error requesting OTP from backend, using local mock:", err);
      const generated = `${Math.floor(100000 + Math.random() * 900000)}`;
      setOtpSentCode(generated);
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpLockoutTime) return;
    setOtpError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/reports/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: portalPhone, otp: portalOtp })
      });

      if (res.ok) {
        setOtpVerified(true);
        const reportsRes = await fetch(`http://localhost:8000/api/v1/reports/patient-reports?phone=${portalPhone}`);
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          const formatted = reportsData.map((r: any) => ({
            id: r.report_id || r.booking_id,
            date: r.booking_date,
            tests: r.tests,
            status: r.status === "Ready" ? "APPROVED" : "PENDING",
            critical: r.critical_flag || false
          }));
          setReportsList(formatted);
        } else {
          setReportsList([]);
        }
      } else {
        const errData = await res.json();
        if (res.status === 429) {
          setOtpLockoutTime(Date.now() + 15 * 60 * 1000);
          setOtpSent(false);
          setPortalOtp("");
          setOtpError(errData.detail || "Too many failed attempts. Locked.");
        } else {
          throw new Error(errData.detail || "Invalid OTP.");
        }
      }
    } catch (err: any) {
      console.log("Error verifying OTP via backend, using local mock check:", err);
      if (portalOtp === otpSentCode) {
        setOtpVerified(true);
        if (portalPhone === "9398175183") {
          setReportsList([
            {
              id: "r-901",
              date: "2026-06-15",
              tests: ["Complete Blood Count (CBC)"],
              status: "APPROVED",
              critical: false
            }
          ]);
        } else {
          setReportsList([]);
        }
      } else {
        const nextAttempts = otpAttempts + 1;
        setOtpAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setOtpLockoutTime(Date.now() + 15 * 60 * 1000);
          setOtpSent(false);
          setPortalOtp("");
          setOtpError("Too many failed attempts. locked for 15 minutes.");
        } else {
          setOtpError(err.message || `Invalid OTP. ${5 - nextAttempts} attempts remaining.`);
        }
      }
    }
  };

  const handleUploadReportSimulate = (bookingId: string) => {
    setAdminBookings(adminBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: "Processing", report_uploaded: true };
      }
      return b;
    }));
  };

  const handleApproveReportSimulate = (bookingId: string) => {
    setAdminBookings(adminBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: "Completed" };
      }
      return b;
    }));
    
    if (bookingId === "b-101") {
      setReportsList([
        {
          id: "r-901",
          date: "2026-06-20",
          tests: ["Complete Blood Count (CBC)"],
          status: "APPROVED",
          critical: false
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white p-8 md:p-12 shadow-md">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("homepage.hero_title")}
            </h1>
            <p className="text-lg text-primary-50/90 font-medium">
              {t("homepage.hero_subtitle")}
            </p>
            <div className="flex gap-4 pt-2">
              <Link
                href="/booking"
                className="px-6 py-3 font-bold bg-accent hover:bg-accent-hover text-white rounded-md transition-standard shadow-sm interactive-target"
              >
                {t("nav.book_test")}
              </Link>
              <a
                href="#packages"
                className="px-6 py-3 font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-md transition-standard interactive-target"
              >
                {t("homepage.explore_packages")}
              </a>
            </div>
          </div>
          
          <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:block pointer-events-none select-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent z-10"></div>
            <img 
              src="/doctor_and_patient.png" 
              alt="Doctor and Patient" 
              className="h-full w-full object-cover object-left opacity-40"
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-standard flex flex-col justify-between">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src="/lab_equipment.png" alt="Discover Tests" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Discover Tests</h3>
                <p className="text-sm text-slate-600 text-slate-600/90 leading-relaxed">
                  Browse over 200+ clinical and STAT blood tests. Direct access, no account required.
                </p>
              </div>
              <Link href="/booking" className="inline-block text-sm font-bold text-primary hover:underline mt-2">
                Browse Test Catalog &rarr;
              </Link>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-standard flex flex-col justify-between">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src="/doctor_and_patient.png" alt="Book Home Collection" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Book Home Collection</h3>
                <p className="text-sm text-slate-600 text-slate-600/90 leading-relaxed">
                  Schedule blood tests at the comfort of your home. Professional certified phlebotomists.
                </p>
              </div>
              <Link href="/booking?type=HOME_COLLECTION" className="inline-block text-sm font-bold text-primary hover:underline mt-2">
                Book Home Visit &rarr;
              </Link>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-standard flex flex-col justify-between">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src="/doctor_and_patient.png" alt="Download Reports" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Download Reports</h3>
                <p className="text-sm text-slate-600 text-slate-600/90 leading-relaxed">
                  Retrieve your clinical PDF reports instantly using secure phone OTP authentication.
                </p>
              </div>
              <button
                onClick={() => setShowReportPortal(true)}
                className="inline-block text-sm font-bold text-primary hover:underline text-left mt-2 cursor-pointer"
              >
                Access OTP Reports Portal &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* FACILITY SHOWCASE */}
        <section className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-2xl font-bold text-slate-800">World-Class Diagnostic Facility</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Equipped with modern technology and staffed by expert professionals ensuring the highest accuracy for your reports.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 text-center">
              <div className="h-64 w-full rounded-lg overflow-hidden relative shadow-sm">
                <img src="/professional_doctor.png" alt="Expert Doctors" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-slate-800">Expert Physicians</h3>
              <p className="text-sm text-slate-500">Consult with our highly qualified doctors.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="h-64 w-full rounded-lg overflow-hidden relative shadow-sm">
                <img src="/lab_technician.png" alt="Certified Technicians" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-slate-800">Certified Technicians</h3>
              <p className="text-sm text-slate-500">Precision and care in every sample collected.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="h-64 w-full rounded-lg overflow-hidden relative shadow-sm">
                <img src="/modern_lab_equipment.png" alt="Advanced Equipment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-slate-800">Advanced Equipment</h3>
              <p className="text-sm text-slate-500">State-of-the-art machinery for reliable results.</p>
            </div>
          </div>
        </section>

        {/* HEALTH PACKAGES SECTION */}
        <section id="packages" className="space-y-6 bg-primary/5 p-8 rounded-2xl border border-primary/10 overflow-hidden">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Popular Health Packages</h2>
            <p className="text-xs text-slate-500">Comprehensive screening bundles designed for your well-being</p>
          </div>

          <div 
            className="relative w-full max-w-3xl mx-auto px-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Viewport with card border and background */}
            <div className="overflow-hidden bg-white border border-primary/20 rounded-xl shadow-sm hover:shadow-md transition-standard">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / packages.length)}%)`,
                  width: `${packages.length * 100}%`
                }}
              >
                {packages.map(pkg => (
                  <div 
                    key={pkg.id} 
                    className="w-full flex-shrink-0"
                    style={{ width: `${100 / packages.length}%` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[320px] select-none">
                      {/* Left side details */}
                      <div className="p-6 md:col-span-2 space-y-4 flex flex-col justify-center">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase animate-pulse">
                              Popular Package
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 hover:text-primary transition-standard leading-tight">
                              <Link href={`/packages/${pkg.slug}`}>{pkg.name}</Link>
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Comprehensive checkup containing selected diagnostic parameters at a bundle discount.
                          </p>
                          <button
                            onClick={() => setActivePackageDetails(pkg)}
                            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 mt-2 focus:outline-none group/btn transition-colors cursor-pointer"
                          >
                            <span>View Included Tests & Prep</span>
                            <span className="transition-transform group-hover/btn:translate-x-0.5">&rarr;</span>
                          </button>
                        </div>
                      </div>

                      {/* Right side booking details */}
                      <div className="p-6 bg-slate-50/50 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 line-through">₹{pkg.price}</span>
                          <p className="text-3xl font-extrabold text-slate-900">₹{pkg.discount_price || pkg.price}</p>
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            Save {Math.round(((pkg.price - (pkg.discount_price || pkg.price)) / pkg.price) * 100)}%
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({ ...pkg, type: "package" });
                            router.push("/booking");
                          }}
                          className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow-sm transition-standard interactive-target"
                        >
                          Book Package
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Left and Right Nav Buttons */}
            {packages.length > 1 && (
              <>
                <button
                  onClick={() => {
                    setCurrentSlide(prev => (prev <= 0 ? packages.length - 1 : prev - 1));
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-standard cursor-pointer z-10 font-bold"
                  aria-label="Previous slide"
                >
                  &larr;
                </button>
                <button
                  onClick={() => {
                    setCurrentSlide(prev => (prev >= packages.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-standard cursor-pointer z-10 font-bold"
                  aria-label="Next slide"
                >
                  &rarr;
                </button>
              </>
            )}

            {/* Dots */}
            {packages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {packages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? "bg-primary w-4" : "bg-slate-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CLINICAL PATIENT FEEDBACK REVIEWS */}
        <section id="reviews" className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center">Patient Experiences</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedReviews.map((rev, idx) => (
                  <div key={rev.id || idx} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex text-amber-400 text-sm">
                        {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed mt-2">
                        "{rev.review_text || rev.text}"
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-4">- {rev.patient_name || rev.name}</p>
                  </div>
                ))}
                {approvedReviews.length === 0 && (
                  <p className="text-xs text-slate-500 text-center col-span-2 py-8">No approved reviews yet. Be the first to write one!</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Share Your Experience</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={newReview.patientName}
                    onChange={(e) => setNewReview({ ...newReview, patientName: e.target.value })}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded p-2 text-xs bg-white focus:border-primary focus:outline-none"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Poor)</option>
                    <option value={1}>1 Star (Very Bad)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Review Details</label>
                  <textarea
                    rows={3}
                    placeholder="Write your feedback..."
                    value={newReview.reviewText}
                    onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                {reviewSubmitMessage && (
                  <p className="text-[10px] font-semibold text-green-700 bg-green-50 p-2 border border-green-200 rounded">
                    {reviewSubmitMessage}
                  </p>
                )}
                
                {reviewSubmitError && (
                  <p className="text-[10px] font-semibold text-red-700 bg-red-50 p-2 border border-red-200 rounded">
                    {reviewSubmitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded transition-standard disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Vicky Diagnostics</h3>
            <p className="text-xs leading-relaxed max-w-sm">
              Digitizing and automating the complete diagnostic laboratory workflow. Delivering accurate reports with medical excellence.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowAdminPipeline(true)}
                className="text-xs text-slate-500 hover:text-white underline"
              >
                🔬 Staff Portal (Admin/Technician View)
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Contact Details</h3>
            <ul className="space-y-2 text-xs">
              <li>📍 101 Diagnostic Towers, Madhapur, Hyderabad</li>
              <li>📞 Phone: <a href="tel:9398175183" className="hover:underline hover:text-white transition-standard">+91 93981 75183</a></li>
              <li>💬 WhatsApp: <a href="https://wa.me/919398175183" target="_blank" rel="noreferrer" className="hover:underline hover:text-white transition-standard">+91 93981 75183</a></li>
              <li>✉️ Email: <a href="mailto:support@vickydiagnostics.com" className="hover:underline hover:text-white transition-standard">support@vickydiagnostics.com</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Center Schedule</h3>
            <ul className="space-y-2 text-xs">
              <li>Monday - Saturday: 6:00 AM - 6:00 PM</li>
              <li>Sunday: Closed (Emergencies only)</li>
            </ul>
            <div className="pt-2 space-y-3">
              <a
                href="https://maps.google.com/?q=Madhapur,Hyderabad"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded transition-standard"
              >
                📍 Get Directions Map
              </a>
              <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-700 relative">
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
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-500">
          &copy; 2026 Vicky Diagnostic Laboratory booking Platform. All rights reserved.
        </div>
      </footer>

      {/* PATIENT PORTAL DIALOG (OTP Access Verification) */}
      {showReportPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowReportPortal(false);
                setOtpSent(false);
                setOtpVerified(false);
                setPortalOtp("");
                setOtpError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold text-slate-800">{t("reports.portal_title")}</h3>
              <p className="text-xs text-slate-500">No passwords or accounts. Fast verification OTP.</p>
            </div>

            {otpLockoutTime ? (
              <div className="p-5 bg-red-50 border border-red-200 rounded-lg text-center space-y-4 animate-in shake duration-300">
                <div className="text-4xl text-red-600">🛑</div>
                <h4 className="font-bold text-red-800 text-sm">Security Lockout Active</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Too many failed authentication attempts. For your safety, access is blocked.
                </p>
                <div className="text-lg font-mono font-bold text-red-700">
                  Please try again in: {Math.floor(lockoutCountdown / 60)}m {lockoutCountdown % 60}s
                </div>
                <div className="pt-2">
                  <a
                    href="tel:9398175183"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-standard shadow"
                  >
                    Call support for manual verification
                  </a>
                </div>
              </div>
            ) : !otpVerified ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t("reports.enter_phone")}</label>
                  <input
                    type="text"
                    disabled={otpSent}
                    placeholder="Enter phone: (e.g. 9398175183)"
                    value={portalPhone}
                    onChange={(e) => setPortalPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50"
                  />
                </div>

                {otpSent && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{t("reports.enter_otp")}</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={portalOtp}
                        onChange={(e) => setPortalOtp(e.target.value)}
                        className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {otpError && <p className="text-xs font-bold text-red-600">{otpError}</p>}

                <button
                  onClick={otpSent ? handleVerifyOtp : handleRequestOtp}
                  className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow transition-standard interactive-target"
                >
                  {otpSent ? t("reports.verify_otp") : t("reports.get_otp")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Welcome, Rajesh Kumar</h4>
                    <p className="text-[10px] text-slate-500">Phone: {portalPhone}</p>
                  </div>
                  <button
                    onClick={() => setOtpVerified(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Logout
                  </button>
                </div>

                {reportsList.length > 0 ? (
                  <div className="space-y-3">
                    {reportsList.map(report => (
                      <div key={report.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              {report.status === "APPROVED" ? t("reports.ready") : t("reports.processing")}
                            </span>
                            <h5 className="font-bold text-slate-800 text-xs mt-1.5">{report.tests.join(", ")}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">Visits Date: {report.date}</p>
                          </div>
                        </div>

                        {report.status === "APPROVED" && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={async () => {
                                setDownloadingReportId(report.id);
                                try {
                                  const res = await fetch(`http://localhost:8000/api/v1/reports/download/${report.id}?phone=${portalPhone}`);
                                  if (res.ok) {
                                    const data = await res.json();
                                    alert("Dynamic secure signed URL generated! Access granted for 5 minutes.");
                                    window.open(data.download_url);
                                  } else {
                                    const errData = await res.json();
                                    alert("Failed to get download link: " + (errData.detail || "Access Denied"));
                                  }
                                } catch (err) {
                                  console.log("Error loading download url from backend, falling back to mock:", err);
                                  alert("Dynamic secure signed URL generated! Access granted for 5 minutes (mock fallback).");
                                  window.open("https://storage.googleapis.com/diagnostic-reports-bucket/reports/b-101/report_complete_blood_count.pdf?GoogleAccessId=service-acc@gcp.com&Expires=300&Signature=mock_sig_hex");
                                } finally {
                                  setDownloadingReportId(null);
                                }
                              }}
                              className="flex-1 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded shadow transition-standard interactive-target"
                            >
                              {downloadingReportId === report.id ? "Generating signed link..." : t("reports.download_pdf")}
                            </button>
                            <a
                              href={`https://wa.me/?text=Download%20my%20report%20from%20Vicky%20Diagnostics%20here:%20https://storage.googleapis.com/diagnostic-reports-bucket/reports/b-101/report.pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded flex items-center justify-center transition-standard interactive-target"
                              title="Share on WhatsApp"
                            >
                              💬 {t("reports.share_whatsapp")}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-4">
                    <div className="text-4xl">📋</div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">No reports ready for this account</h4>
                      <p className="text-xs text-slate-500">
                        {t("reports.no_reports", { date: "within 12-24 hours" })}
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Processing Pipeline</p>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                        <span className="text-primary">1. Sample Collected</span>
                        <span className="text-primary font-bold animate-pulse">2. Lab Analysis</span>
                        <span>3. Approval</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-2/3"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OPERATIONS ADMIN PANEL SIMULATOR (STAFF VIEWS) */}
      {showAdminPipeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdminPipeline(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                🔬 Operational Booking Pipeline (Main Admin & Lab Tech View)
              </h3>
              <p className="text-xs text-slate-500">
                Simulate the internal workflow from sample collection to technician PDF upload and admin approval.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 bg-slate-100 p-2 rounded">
                  1. Lab Technician: Upload PDF Reports
                </h4>
                <div className="space-y-3">
                  {adminBookings.filter(b => b.status === "Sample Collected").map(b => (
                    <div key={b.id} className="border border-slate-200 rounded p-3 text-xs space-y-3 bg-slate-50">
                      <div>
                        <p className="font-bold">{b.patient} ({b.phone})</p>
                        <p className="text-slate-500">Test: {b.tests.join(", ")} · Mode: {b.type}</p>
                      </div>
                      
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center bg-white space-y-2">
                        <p className="text-[10px] text-slate-500">PDF Document Drag & Drop</p>
                        <button
                          onClick={() => handleUploadReportSimulate(b.id)}
                          className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded"
                        >
                          Simulate PDF Upload &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                  {adminBookings.filter(b => b.status === "Sample Collected").length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No bookings in "Sample Collected" stage.</p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 bg-slate-100 p-2 rounded">
                  2. Support Admin: Review & Approve Reports
                </h4>
                <div className="space-y-3">
                  {adminBookings.filter(b => b.status === "Processing" && b.report_uploaded).map(b => (
                    <div key={b.id} className="border border-slate-200 rounded p-3 text-xs space-y-3 bg-slate-50 animate-in fade-in duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{b.patient} ({b.phone})</p>
                          <p className="text-slate-500">Test: {b.tests.join(", ")}</p>
                          <p className="text-[10px] text-slate-400 mt-1">📄 File: report_{b.id}.pdf</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveReportSimulate(b.id)}
                          className="flex-1 py-1.5 bg-accent hover:bg-accent-hover text-white font-bold rounded text-[10px] transition-standard"
                        >
                          ✓ Audit & Approve Report
                        </button>
                      </div>
                    </div>
                  ))}
                  {adminBookings.filter(b => b.status === "Processing" && b.report_uploaded).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No reports pending administrative review.</p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 bg-slate-100 p-2 rounded">
                  3. Support Admin: Review & Approve Patient Reviews
                </h4>
                <div className="space-y-3">
                  {pendingReviews.map(rev => (
                    <div key={rev.id} className="border border-slate-200 rounded p-3 text-xs space-y-3 bg-slate-50 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <p className="font-bold">{rev.patient_name} ({rev.rating} Stars)</p>
                        <p className="text-slate-600 italic">"{rev.review_text}"</p>
                      </div>
                      <button
                        onClick={() => handleApproveReview(rev.id)}
                        className="w-full py-1.5 bg-accent hover:bg-accent-hover text-white font-bold rounded text-[10px] transition-standard cursor-pointer"
                      >
                        ✓ Approve & Publish Review
                      </button>
                    </div>
                  ))}
                  {pendingReviews.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No reviews pending administrative approval.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Booking Pipeline Log</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="border border-slate-200 rounded p-2 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Confirmed</p>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {adminBookings.filter(b => b.status === "Confirmed").length}
                  </p>
                </div>
                <div className="border border-slate-200 rounded p-2 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Collected / Processing</p>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {adminBookings.filter(b => b.status === "Sample Collected" || b.status === "Processing").length}
                  </p>
                </div>
                <div className="border border-slate-200 rounded p-2 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Completed</p>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {adminBookings.filter(b => b.status === "Completed").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
              💡 <strong>Operational Flow Simulation Instruction:</strong> Click <strong>Simulate PDF Upload</strong> under the Lab Technician panel to upload the report for Saraswathi Devi. Once uploaded, she moves to the Support Admin panel. Click <strong>Audit & Approve Report</strong> to complete the process and push the record to "Completed".
            </div>
          </div>
        </div>
      )}
      {/* Package Details Modal */}
      {activePackageDetails && (() => {
        const details = generatePackageDetails(activePackageDetails, tests);
        if (!details) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                    Health Package Details
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight pr-4">
                    {activePackageDetails.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActivePackageDetails(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full h-8 w-8 flex items-center justify-center focus:outline-none transition-colors text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📝</span> Package Overview
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {details.description}
                  </p>
                </div>

                {/* Included Tests List */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🧪</span> Included Diagnostic Tests ({details.includedTests.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto">
                    {details.includedTests.map(test => (
                      <span key={test.id} className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                        {test.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preparation Instructions */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span> Preparation Required
                  </h4>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed bg-amber-50/70 p-3 rounded-lg border border-amber-100">
                    {details.preparation}
                  </p>
                </div>

                {/* Why Take This Test */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡</span> Why Should You Book This Package?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    {details.whyTake}
                  </p>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Dos */}
                  <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 space-y-2">
                    <h5 className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                      <span className="text-emerald-500">✅</span> Do's Before Test
                    </h5>
                    <ul className="list-none space-y-1.5 text-[11px] text-slate-600 pl-1">
                      {details.dos.map((item, idx) => (
                        <li key={idx} className="relative pl-3.5 leading-normal">
                          <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts */}
                  <div className="bg-rose-50/30 border border-rose-100 rounded-lg p-3 space-y-2">
                    <h5 className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wide flex items-center gap-1">
                      <span className="text-rose-500">❌</span> Don'ts Before Test
                    </h5>
                    <ul className="list-none space-y-1.5 text-[11px] text-slate-600 pl-1">
                      {details.donts.map((item, idx) => (
                        <li key={idx} className="relative pl-3.5 leading-normal">
                          <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Package Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-slate-900 font-mono">₹{activePackageDetails.discount_price || activePackageDetails.price}</span>
                    {activePackageDetails.discount_price && (
                      <span className="text-xs text-slate-400 line-through">₹{activePackageDetails.price}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActivePackageDetails(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      addToCart({ ...activePackageDetails, type: "package" });
                      setActivePackageDetails(null);
                      router.push("/booking");
                    }}
                    className="px-5 py-2 text-xs font-bold rounded-md bg-accent hover:bg-accent-hover text-white transition-all shadow-sm cursor-pointer"
                  >
                    Book Package
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
