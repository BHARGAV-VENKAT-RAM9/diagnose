"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "./context/TranslationContext";
import { useCart } from "./context/CartContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import catalogData from "./data/catalog.json";
import { TestCard } from "../components/TestCard";
import { PackageCard } from "../components/PackageCard";
import { ReviewsSection } from "../components/ReviewsSection";
import { AdminPipelineSimulator } from "../components/AdminPipelineSimulator";

const LOCAL_TESTS = catalogData.tests;
const LOCAL_PACKAGES = catalogData.packages;


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

const generateTestDetails = (test: any) => {
  if (!test) return null;
  const name = (test.name || "").toUpperCase();
  const sampleType = (test.sample_type || "").toUpperCase();
  const preparation = test.preparation || "No special preparation required.";
  const description = test.description || `Clinical laboratory evaluation for ${test.name || "this biomarker"}. High accuracy reports delivered within standard turnaround times.`;

  let whyTake = "This test is recommended to screen for subclinical deficiencies, evaluate organ function, monitor ongoing therapies, or establish a baseline diagnostic profile for wellness tracking.";
  let dos = [
    "Stay well-hydrated by drinking normal amounts of water before the sample collection.",
    "Inform the laboratory team about any ongoing prescription medicines, vitamins, or supplements you are taking."
  ];
  let donts = [
    "Avoid consuming alcohol or high-fat meals for 24 hours prior to the test.",
    "Do not engage in strenuous physical exercise or heavy workouts immediately before your slot."
  ];

  if (name.includes("VITAMIN D") || name.includes("CHOLECALCIFEROL") || name.includes("VITAMIN B12") || name.includes("FOLATE")) {
    whyTake = "Helps assess vitamin and nutrient levels which are essential for bone health, nerve function, red blood cell production, immune response, and overall cellular wellness.";
    dos = [
      "Consult your physician if you should stop taking high-dose biotin or multivitamin supplements 24 hours prior to the test.",
      "Stay hydrated by drinking plenty of plain water before the sample collection."
    ];
    donts = [
      "Avoid taking any dietary supplements or vitamin pills on the morning of the test before your sample is drawn.",
      "Do not perform heavy resistance training just before your appointment."
    ];
  } else if (name.includes("THYROID") || name.includes("TSH") || name.includes("T3") || name.includes("T4")) {
    whyTake = "Used to evaluate the function of your thyroid gland and diagnose conditions such as hyperthyroidism (overactive thyroid) or hypothyroidism (underactive thyroid).";
    dos = [
      "Have your sample collected in the morning, as thyroid hormone levels can show daily fluctuations.",
      "Inform the technician if you are on thyroid replacement medications (e.g., Levothyroxine)."
    ];
    donts = [
      "Do not take your daily dose of thyroid medication *before* the blood draw (take it immediately after).",
      "Avoid high levels of stress or severe physical exertion before the test."
    ];
  } else if (name.includes("GLUCOSE") || name.includes("SUGAR") || name.includes("HBA1C") || name.includes("DIABETES") || name.includes("INSULIN")) {
    whyTake = "Critical for diagnosing prediabetes, type 1/2 diabetes, and monitoring glucose control over short or long terms (HbA1c).";
    if (preparation.toUpperCase().includes("FASTING")) {
      dos = [
        "Strictly fast for 8 to 12 hours before the test. You may only drink plain water.",
        "Ensure the blood sample is collected first thing in the morning after fasting."
      ];
      donts = [
        "Avoid chewing gum, drinking coffee, tea, juices, or smoking during the fasting window.",
        "Do not skip regular diabetes medications unless explicitly advised by your doctor."
      ];
    } else if (name.includes("POST PRANDIAL") || name.includes("POST LUNCH") || name.includes("PPBS")) {
      dos = [
        "Ensure the sample is collected exactly 2 hours after you start eating your meal.",
        "Eat your normal breakfast or lunch as prescribed/recommended."
      ];
      donts = [
        "Do not consume any snacks, tea, or beverages between the end of your meal and the blood collection.",
        "Avoid any strenuous physical activity during the 2-hour waiting period."
      ];
    } else {
      dos = [
        "Ensure you remain hydrated prior to the test.",
        "Inform the phlebotomist if you are diabetic and list your medications."
      ];
      donts = [
        "Avoid sudden dietary changes or excessive sweet intake on the day before the test.",
        "Do not perform extreme physical workouts prior to blood collection."
      ];
    }
  } else if (name.includes("LIPID") || name.includes("CHOLESTEROL") || name.includes("TRIGLYCERID") || name.includes("HDL") || name.includes("LDL")) {
    whyTake = "Assesses cardiovascular health, cholesterol balance, and screens for the risk of heart disease or stroke.";
    dos = [
      "Fast strictly for 9 to 12 hours before the test (water is permitted).",
      "Maintain a stable, normal diet for at least 3-4 days before the test."
    ];
    donts = [
      "Do not drink alcohol for at least 24 to 48 hours prior to the blood draw.",
      "Avoid eating fatty, heavy, or fried food the night before your test."
    ];
  } else if (name.includes("CBC") || name.includes("HEMOGLOBIN") || name.includes("CELL COUNT") || name.includes("PLATELET") || name.includes("WBC")) {
    whyTake = "Provides a complete profile of blood cells (red, white, and platelets) to check for anemia, infections, inflammation, and immune health.";
    dos = [
      "Drink standard amounts of water to stay hydrated so veins are easier to access.",
      "Inform the technician if you have had recent fever, infections, or bleeding episodes."
    ];
    donts = [
      "Avoid smoking right before the test.",
      "Do not exercise heavily on the morning of the test."
    ];
  } else if (name.includes("KIDNEY") || name.includes("RENAL") || name.includes("CREATININE") || name.includes("UREA") || name.includes("URIC ACID")) {
    whyTake = "Evaluates renal filtration and kidney health, helping to screen for dysfunctions, dehydration, or electrolyte imbalances.";
    dos = [
      "Keep hydration normal by drinking clean water.",
      "Inform your doctor if you take NSAIDs (painkillers) regularly, as they affect kidney parameters."
    ];
    donts = [
      "Avoid eating large amounts of cooked meat or protein shakes 24 hours prior to creatinine tests.",
      "Avoid dehydration or excessive sweating before sample collection."
    ];
  } else if (name.includes("LIVER") || name.includes("LFT") || name.includes("BILIRUBIN") || name.includes("SGOT") || name.includes("SGPT") || name.includes("ALBUMIN")) {
    whyTake = "Assesses the synthetic, metabolic, and excretory function of the liver and gall bladder, screening for infections, damage, or enzyme leakage.";
    dos = [
      "Inform the laboratory team about any alcohol consumption, antibiotics, or chronic therapies.",
      "Drink plain water to stay hydrated before your slot."
    ];
    donts = [
      "Do not consume alcohol for at least 24-48 hours prior to testing.",
      "Avoid heavy meals or high-fat foods in the evening before the test."
    ];
  } else if (sampleType === "URINE" || name.includes("URINE")) {
    whyTake = "Used to detect urinary tract infections (UTIs), kidney disorders, diabetes, and other metabolic issues.";
    dos = [
      "Collect the first-morning urine sample if possible, as it is most concentrated.",
      "Provide a clean-catch mid-stream urine sample (discard the first portion, collect the middle portion directly in the sterile cup).",
      "Wash and dry your hands and genital area before collecting to prevent external contamination."
    ];
    donts = [
      "Do not touch the inside of the sterile container or lid with your fingers.",
      "Avoid taking the test during your menstrual cycle if possible (or inform the lab technician)."
    ];
  } else if (sampleType === "RADIOLOGY" || sampleType === "SCAN" || name.includes("ECG") || name.includes("XRAY") || name.includes("X-RAY") || name.includes("ULTRASOUND") || name.includes("USG")) {
    whyTake = "Helps visualize bone, soft tissue structures, or electrical cardiac activity (ECG) to identify structural or physiological anomalies.";
    dos = [
      "Wear comfortable, loose-fitting clothing that is easy to remove or adjust.",
      "Inform the technician if you have any implants, metal in your body, pacemakers, or if there is any possibility of pregnancy."
    ];
    donts = [
      "Do not wear metallic jewelry, watches, keys, or clothing with metal buttons/zippers near the scan area.",
      "Do not drink caffeine or smoke for 2 hours before an ECG, as it can affect heart rate results."
    ];
  }

  return {
    description,
    preparation,
    whyTake,
    dos,
    donts
  };
};

const SkeletonCard = () => (
  <div className="glass-card rounded-xl p-5 flex flex-col justify-between min-h-[255px] shadow-sm animate-pulse">
    <div className="space-y-4">
      <div className="h-4 w-20 bg-slate-200/80 rounded-full skeleton-pulse"></div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200/80 rounded skeleton-pulse"></div>
        <div className="h-3 w-5/6 bg-slate-200/80 rounded skeleton-pulse"></div>
        <div className="h-3 w-4/6 bg-slate-200/80 rounded skeleton-pulse"></div>
      </div>
    </div>
    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
      <div className="space-y-1">
        <div className="h-3 w-8 bg-slate-200/80 rounded skeleton-pulse"></div>
        <div className="h-4 w-12 bg-slate-200/80 rounded skeleton-pulse"></div>
      </div>
      <div className="h-8 w-20 bg-slate-200/80 rounded-md skeleton-pulse"></div>
    </div>
  </div>
);

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();

  // Dynamic catalog state
  const [tests, setTests] = useState<any[]>(LOCAL_TESTS);
  const [patientToken, setPatientToken] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>(LOCAL_PACKAGES);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
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

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activePackageDetails, setActivePackageDetails] = useState<any>(null);
  const [activeTestDetails, setActiveTestDetails] = useState<any>(null);

  useEffect(() => {
    if (packages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % packages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [packages.length]);

  // Cart & Booking Flow Actions
  const { addToCart } = useCart();

  // Collection Mode Choice Modal States
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingSelectionItem, setPendingSelectionItem] = useState<any>(null);
  const [pendingConcernSelection, setPendingConcernSelection] = useState<string | null>(null);

  const handleTestClickHomepage = (test: any) => {
    setPendingSelectionItem(test);
    setPendingConcernSelection(null);
    setShowModeModal(true);
  };

  const handleConcernClickHomepage = (concernId: string) => {
    setPendingConcernSelection(concernId);
    setPendingSelectionItem(null);
    setShowModeModal(true);
  };

  const selectHomeCollection = () => {
    if (pendingSelectionItem) {
      addToCart({ ...pendingSelectionItem, type: "test" });
      setShowModeModal(false);
      setPendingSelectionItem(null);
      router.push("/booking?type=HOME_COLLECTION");
    } else if (pendingConcernSelection) {
      const concernId = pendingConcernSelection;
      setShowModeModal(false);
      setPendingConcernSelection(null);
      router.push(`/booking?concern=${concernId}&type=HOME_COLLECTION`);
    }
  };

  const selectLabVisit = () => {
    if (pendingSelectionItem) {
      addToCart({ ...pendingSelectionItem, type: "test" });
      setShowModeModal(false);
      setPendingSelectionItem(null);
      router.push("/booking?type=LAB_VISIT");
    } else if (pendingConcernSelection) {
      const concernId = pendingConcernSelection;
      setShowModeModal(false);
      setPendingConcernSelection(null);
      router.push(`/booking?concern=${concernId}&type=LAB_VISIT`);
    }
  };

  // Department-based Active Tab (Aarthi Scans inspired)
  const [activeDeptTab, setActiveDeptTab] = useState<"blood" | "scans" | "packages">("blood");

  // Fasting Calculator state hooks
  const [calcTest, setCalcTest] = useState("t4"); // Defaults to LFT (t4)
  const [calcTime, setCalcTime] = useState("08:00"); // Defaults to 8:00 AM
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fastingSchedule = React.useMemo(() => {
    let fastingHours = 0;
    let testName = "Complete Blood Count";
    if (calcTest === "t4") {
      fastingHours = 10;
      testName = "Liver Function Test (LFT)";
    } else if (calcTest === "t2") {
      fastingHours = 10;
      testName = "Vitamin D (25-Hydroxy)";
    } else if (calcTest === "t3") {
      fastingHours = 8;
      testName = "Thyroid Profile (T3, T4, TSH)";
    } else {
      return {
        required: false,
        hours: 0,
        testName: "Complete Blood Count (CBC)",
        lastMeal: "No fasting required",
        instructions: "You can eat and drink normally before this test. No dietary restrictions."
      };
    }

    const [hour, minute] = calcTime.split(":").map(Number);
    let mealHour = hour - fastingHours;
    let mealDay = "previous night";
    
    if (mealHour < 0) {
      mealHour = 12 + mealHour; 
      mealDay = "previous night";
    } else if (mealHour === 0) {
      mealHour = 12;
      mealDay = "previous night";
    } else {
      mealDay = "same day morning";
    }

    const formatTime = (h: number, m: number, meridian: string) => {
      return `${h}:${String(m).padStart(2, "0")} ${meridian}`;
    };

    const mealMeridian = mealDay === "previous night" ? "PM" : "AM";

    return {
      required: true,
      hours: fastingHours,
      testName,
      lastMeal: `${formatTime(mealHour, minute, mealMeridian)} (${mealDay})`,
      instructions: `Strict fasting required for ${fastingHours} hours. Only plain water is allowed. Do not consume tea, coffee, breakfast, or juice during this period.`
    };
  }, [calcTest, calcTime]);

  const pathologyTests = React.useMemo(() => {
    return tests.filter(t => 
      t.sample_type !== "Radiology" && 
      t.sample_type !== "Scan" && 
      !t.name.toLowerCase().includes("ecg") && 
      !t.name.toLowerCase().includes("xray") && 
      !t.name.toLowerCase().includes("ultrasound") && 
      !t.name.toLowerCase().includes("scan")
    );
  }, [tests]);

  const radiologyTests = React.useMemo(() => {
    return tests.filter(t => 
      t.sample_type === "Radiology" || 
      t.sample_type === "Scan" || 
      t.name.toLowerCase().includes("ecg") || 
      t.name.toLowerCase().includes("xray") || 
      t.name.toLowerCase().includes("ultrasound") || 
      t.name.toLowerCase().includes("scan")
    );
  }, [tests]);

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
    setLoadingCatalog(true);
    try {
      const testsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/catalog/tests");
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        if (testsData && testsData.length > 0) {
          setTests(testsData);
        }
      }
      const pkgsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/catalog/packages");
      if (pkgsRes.ok) {
        const pkgsData = await pkgsRes.json();
        if (pkgsData && pkgsData.length > 0) {
          setPackages(pkgsData);
        }
      }
    } catch (err) {
      console.log("Using local fallbacks for catalog:", err);
    } finally {
      setTimeout(() => {
        setLoadingCatalog(false);
      }, 600);
    }
  };

  const fetchApprovedReviews = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/admin/reviews/approved");
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
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/admin/reviews", {
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
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/admin/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
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
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/admin/reviews/pending", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingReviews(data);
      }
    } catch (err) {
      console.log("Error fetching pending reviews:", err);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    let token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    let adminUserId = typeof window !== "undefined" ? localStorage.getItem("admin_user_id") : null;

    if (!token || !adminUserId) {
      const usernameInput = prompt("Enter Admin/Staff Username to approve review:");
      if (!usernameInput) return;
      const passwordInput = prompt("Enter Password:");
      if (!passwordInput) return;

      try {
        const loginRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        if (!loginRes.ok) {
          alert("Failed to authenticate as Admin.");
          return;
        }
        const loginData = await loginRes.json();
        token = loginData.access_token;
        adminUserId = loginData.user_id;
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", token || "");
          localStorage.setItem("admin_user_id", adminUserId || "");
        }
      } catch (err) {
        alert("Authentication network error.");
        return;
      }
    }

    try {
      const approveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + ""}/api/v1/admin/reviews/approve/${reviewId}?admin_user_id=${adminUserId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
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
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (token) {
      fetchAdminBookings();
      fetchPendingReviews();
    }
  }, []);

  // Admin Pipeline Simulation States
  const [showAdminPipeline, setShowAdminPipeline] = useState(false);

  useEffect(() => {
    if (showAdminPipeline) {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      if (!token) {
        const usernameInput = prompt("Enter Admin/Staff Username to view pipeline:");
        if (!usernameInput) {
          setShowAdminPipeline(false);
          return;
        }
        const passwordInput = prompt("Enter Password:");
        if (!passwordInput) {
          setShowAdminPipeline(false);
          return;
        }
        
        fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        })
        .then(res => {
          if (!res.ok) throw new Error("Auth failed");
          return res.json();
        })
        .then(data => {
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", data.access_token);
            localStorage.setItem("admin_user_id", data.user_id);
            localStorage.setItem("admin_role", data.role);
          }
          fetchAdminBookings();
          fetchPendingReviews();
        })
        .catch(err => {
          alert("Failed to authenticate as staff.");
          setShowAdminPipeline(false);
        });
      } else {
        fetchAdminBookings();
        fetchPendingReviews();
      }
    }
  }, [showAdminPipeline]);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + ""}/api/v1/reports/request-otp?phone=${portalPhone}`, {
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
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/reports/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: portalPhone, otp: portalOtp })
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.patient_token;
        setPatientToken(token);
        setOtpVerified(true);
        const reportsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + ""}/api/v1/reports/patient-reports?phone=${portalPhone}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
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
    <div className="flex flex-col min-h-screen relative">
      {/* Premium ambient background mesh blobs */}
      <div className="ambient-blob-container">
        <div className="ambient-blob-1"></div>
        <div className="ambient-blob-2"></div>
      </div>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-2xl bg-primary text-white shadow-md grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-5 z-10">
            <span className="self-start text-xs font-bold bg-gold text-slate-900 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
              Accredited Clinical Excellence
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {t("homepage.hero_title")}
            </h1>
            <p className="text-sm md:text-base text-white/95 leading-relaxed max-w-lg">
              Diagnostic accuracy you can trust. Book blood tests, scans, and packages online with professional home sample collection.
            </p>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block h-full min-h-[350px]">
            {/* Blend fade from primary color to transparent over the image */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent z-10"></div>
            <img 
              src="/doctor_and_patient.png" 
              alt="Doctor and Patient" 
              className="h-full w-full object-cover object-center"
            />
          </div>
        </section>

        {/* ORGAN / HEALTH CONCERN GRID (Apollo-Inspired) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Health Concerns</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { id: "heart", name: "Heart Health", icon: "❤️", bg: "from-red-50 to-red-100/50 border-red-100 hover:border-red-300 text-red-700" },
              { id: "diabetes", name: "Diabetes Care", icon: "🩸", bg: "from-orange-50 to-orange-100/50 border-orange-100 hover:border-orange-300 text-orange-700" },
              { id: "thyroid", name: "Thyroid Profile", icon: "🧪", bg: "from-blue-50 to-blue-100/50 border-blue-100 hover:border-blue-300 text-blue-700" },
              { id: "kidney", name: "Kidney Health", icon: "🧬", bg: "from-indigo-50 to-indigo-100/50 border-indigo-100 hover:border-indigo-300 text-indigo-700" },
              { id: "liver", name: "Liver Wellness", icon: "🥃", bg: "from-amber-50 to-amber-100/50 border-amber-100 hover:border-amber-300 text-amber-700" },
              { id: "bone", name: "Bone & Joints", icon: "🦴", bg: "from-slate-50 to-slate-100/50 border-slate-100 hover:border-slate-300 text-slate-700" },
              { id: "fullbody", name: "Full Body Check", icon: "🩺", bg: "from-green-50 to-green-100/50 border-green-100 hover:border-green-300 text-green-700" }
            ].map((concern) => (
              <button
                key={concern.id}
                onClick={() => handleConcernClickHomepage(concern.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border bg-gradient-to-br ${concern.bg} shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
              >
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{concern.icon}</span>
                <span className="text-xs font-bold tracking-tight text-slate-700 text-center">{concern.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* DEPARTMENT SECTION & SHOWCASE (Aarthi-Inspired) */}
        <section className="space-y-6 bg-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Popular Services</h2>
              <p className="text-xs text-slate-500 mt-1">Select diagnostic category to browse best-selling panels</p>
            </div>
            
            {/* Tab Buttons */}
            <div className="flex overflow-x-auto whitespace-nowrap max-w-full bg-slate-200/60 p-1 rounded-full text-[11px] sm:text-xs font-bold gap-1 scrollbar-none">
              <button
                onClick={() => setActiveDeptTab("blood")}
                className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeDeptTab === "blood" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-primary"
                }`}
              >
                🔬 Pathology (Blood/Urine)
              </button>
              <button
                onClick={() => setActiveDeptTab("scans")}
                className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeDeptTab === "scans" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-primary"
                }`}
              >
                ⚡ Radiology (Scans/ECG)
              </button>
              <button
                onClick={() => setActiveDeptTab("packages")}
                className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeDeptTab === "packages" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-primary"
                }`}
              >
                📦 Wellness Packages
              </button>
            </div>
          </div>

          {/* Tab Content Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {loadingCatalog ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            ) : (
              <>
                {activeDeptTab === "blood" &&
                  pathologyTests.slice(0, 4).map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewDetails={setActiveTestDetails}
                      onBook={handleTestClickHomepage}
                    />
                  ))}

                {activeDeptTab === "scans" &&
                  radiologyTests.slice(0, 4).map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewDetails={setActiveTestDetails}
                      onBook={handleTestClickHomepage}
                    />
                  ))}

                {activeDeptTab === "packages" &&
                  packages.slice(0, 4).map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onViewDetails={setActivePackageDetails}
                      onBook={() => router.push("/booking?filter=packages")}
                    />
                  ))}
              </>
            )}
          </div>
          
          <div className="text-center pt-2">
            <Link 
              href="/booking" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover hover:underline"
            >
              <span>Explore All {tests.length}+ Diagnostic Services</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </section>

        {/* QUICK ACTION PORTALS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-standard flex flex-col justify-between">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src="/lab_equipment.png" alt="Discover Tests" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Discover Tests</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Browse over 200+ clinical and STAT blood tests. Direct access, no account required.
                </p>
              </div>
              <Link href="/booking" className="inline-block text-sm font-bold text-primary hover:underline mt-2">
                Browse Test Catalog &rarr;
              </Link>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-standard flex flex-col justify-between">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src="/home_collection.png" alt="Book Home Collection" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Book Home Collection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Schedule blood tests at the comfort of your home. Professional certified phlebotomists.
                </p>
              </div>
              <Link href="/booking?type=HOME_COLLECTION" className="inline-block text-sm font-bold text-primary hover:underline mt-2">
                Book Home Visit &rarr;
              </Link>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-standard flex flex-col justify-between">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src="/doctor_consultation.png" alt="Download Reports" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Download Reports</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
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

        {/* FACILITY SHOWCASE WITH PHOTOS */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
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

        {/* WHY CHOOSE US / ADVANTAGE SHOWCASE (Aarthi/Apollo Inspired) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              The Vicky Diagnostics Edge
            </span>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Why Choose Us?</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              How we deliver a premium clinical experience compared to traditional laboratories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "6-12 Hr WhatsApp Reports",
                desc: "Get your medical PDF directly on WhatsApp within 12 hours. No complex portal log-ins required.",
                icon: "⚡",
                weOffer: "Instant WhatsApp delivery & secure cloud link",
                others: "Must log in to portal or visit centre (24-48 hrs)"
              },
              {
                title: "Cold-Chain Logistics",
                desc: "Samples are transported in temperature-controlled barcoded boxes to prevent blood cell degradation.",
                icon: "🧊",
                weOffer: "Chilled smart boxes with real-time temperature log",
                others: "Samples carried in open ambient bags by courier"
              },
              {
                title: "Dual MD Pathologist Audit",
                desc: "Every automated diagnostic result is cross-checked and signed off by a certified MD pathologist.",
                icon: "🔬",
                weOffer: "Double verified check by senior physicians",
                others: "Machine print-outs generated without doctor audit"
              },
              {
                title: "Certified Phlebotomists",
                desc: "Home collections performed by full-time medical technicians trained in sterile pediatric/geriatric blood draw.",
                icon: "🏠",
                weOffer: "Certified expert staff with verification safety code",
                others: "Third-party gig workers or uncertified local collectors"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 hover:border-primary/30 rounded-xl p-5 hover-scale flex flex-col justify-between space-y-4 shadow-sm">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-2xl shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2 text-[10px]">
                  <div>
                    <span className="font-extrabold text-emerald-700 block bg-emerald-50 px-2 py-0.5 rounded">✓ Vicky Diagnostics:</span>
                    <span className="text-slate-600 block pl-2 mt-0.5">{item.weOffer}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-rose-700 block bg-rose-50 px-2 py-0.5 rounded">✗ Traditional Labs:</span>
                    <span className="text-slate-400 block pl-2 mt-0.5">{item.others}</span>
                  </div>
                </div>
              </div>
            ))}
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
                            router.push("/booking?filter=packages");
                          }}
                          className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow-sm transition-standard interactive-target"
                        >
                          Explore Packages
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
            <div className="text-center pt-6">
              <Link 
                href="/booking?filter=packages" 
                className="inline-flex items-center gap-1.5 px-6 py-3 font-bold bg-primary hover:bg-primary-hover text-white text-xs rounded-lg transition-all shadow cursor-pointer uppercase tracking-wider"
              >
                Explore All Packages &rarr;
              </Link>
            </div>
          </div>
        </section>

        <ReviewsSection
          approvedReviews={approvedReviews}
          newReview={newReview}
          setNewReview={setNewReview}
          onSubmitReview={handleSubmitReview}
          submittingReview={submittingReview}
          reviewSubmitMessage={reviewSubmitMessage}
          reviewSubmitError={reviewSubmitError}
        />

        {/* FAQ ACCORDION SECTION (Aarthi/Apollo inspired) */}
        <section className="space-y-6 max-w-4xl mx-auto border-t border-slate-100 pt-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Common Queries
            </span>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm">Clear, transparent answers about our clinical operations.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Do I need to fast for all blood test bookings?",
                a: "No, only specific tests (like Fasting Blood Sugar, Lipid Profiles, and Liver Function Tests) require strict fasting of 10-12 hours. Others, like Vitamin D, Thyroid, and CBC, can be done non-fasting. Use our Fasting Calculator above to verify requirements for your specific tests."
              },
              {
                q: "How safe is the Home Collection process?",
                a: "Extremely safe. Our phlebotomists are full-time certified experts equipped with sterile, single-use, double-vacuum collection tubes and disposable needles. Before the draw, you will receive a unique security code to verify their credentials at your doorstep."
              },
              {
                q: "When and how will I receive my PDF test reports?",
                a: "Reports are processed in our NABL-accredited laboratory and verified by an MD pathologist. Once approved, the PDF is instantly sent to your WhatsApp number within 6 to 12 hours. You can also view or download them using the OTP Reports Portal on our website."
              },
              {
                q: "What is temperature-controlled cold-chain transport?",
                a: "After collection, your blood samples are immediately sealed in chilled transport containers equipped with electronic temperature loggers. This guarantees they stay between 2°C and 8°C during transit to prevent cellular degradation before laboratory testing."
              }
            ].map((faq, idx) => (
              <div key={idx} className="glass-card rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-slate-800 hover:text-primary transition-colors text-xs sm:text-sm cursor-pointer focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-mono text-slate-400">
                    {openFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />

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
                                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + ""}/api/v1/reports/download/${report.id}?phone=${portalPhone}`, {
                                    headers: {
                                      "Authorization": `Bearer ${patientToken}`
                                    }
                                  });
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

      <AdminPipelineSimulator
        showAdminPipeline={showAdminPipeline}
        setShowAdminPipeline={setShowAdminPipeline}
        adminBookings={adminBookings}
        handleUploadReportSimulate={handleUploadReportSimulate}
        handleApproveReportSimulate={handleApproveReportSimulate}
        pendingReviews={pendingReviews}
        handleApproveReview={handleApproveReview}
      />
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

      {/* Collection Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 p-6 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-2xl">🏥</span>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                Select Collection Mode
              </h3>
              <p className="text-xs text-slate-500">
                How would you like to schedule the sample collection for{" "}
                <strong>
                  {pendingSelectionItem ? pendingSelectionItem.name : "your selected health concern"}
                </strong>
                ?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={selectHomeCollection}
                className="w-full p-4 border border-slate-200 hover:border-primary/40 rounded-xl hover:bg-slate-50 text-left transition-all flex items-center gap-3 cursor-pointer group"
              >
                <span className="text-xl">🏠</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-primary">Home Sample Collection</h4>
                  <p className="text-[10px] text-slate-400">Certified phlebotomist visits your doorstep.</p>
                </div>
              </button>

              <button
                onClick={selectLabVisit}
                className="w-full p-4 border border-slate-200 hover:border-primary/40 rounded-xl hover:bg-slate-50 text-left transition-all flex items-center gap-3 cursor-pointer group"
              >
                <span className="text-xl">🔬</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-primary">Lab Walk-In Visit</h4>
                  <p className="text-[10px] text-slate-400">Visit our nearest diagnostic clinic center.</p>
                </div>
              </button>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowModeModal(false);
                  setPendingSelectionItem(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Details Modal */}
      {activeTestDetails && (() => {
        const details = generateTestDetails(activeTestDetails);
        if (!details) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded-full inline-block mb-1">
                    {activeTestDetails.sample_type} test
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight pr-4">
                    {activeTestDetails.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTestDetails(null)}
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
                    <span>📝</span> Clinical Description
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {details.description}
                  </p>
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
                    <span>💡</span> Why Should You Take This Test?
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
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Test Price</span>
                  <span className="text-xl font-extrabold text-slate-900">₹{activeTestDetails.price}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTestDetails(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setActiveTestDetails(null);
                      handleTestClickHomepage(activeTestDetails);
                    }}
                    className="px-5 py-2 text-xs font-bold rounded-md bg-accent hover:bg-accent-hover text-white transition-all shadow-sm cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Contact Us Widget */}
      <a
        href="tel:9398175183"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group"
        title="Contact Us"
      >
        <span className="text-2xl">📞</span>
        <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded shadow-md whitespace-nowrap origin-right transition-all duration-200 font-bold uppercase tracking-wider">
          Contact Us
        </span>
      </a>
    </div>
  );
}
