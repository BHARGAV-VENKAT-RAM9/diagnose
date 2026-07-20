"use client";

import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { useTranslation } from "../context/TranslationContext";
import { useCart } from "../context/CartContext";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import localTests from "../data/local_tests.json";

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

const PHLEBOTOMIST_CONTACTS: { [key: string]: string } = {
  "John Doe": "+91 99887 76655",
  "Jane Smith": "+91 98765 43210",
  "Vikram Rathore": "+91 91234 56789",
  "Home Collector Team": "+91 93981 75183",
  "collector": "+91 93981 75183"
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

function BookingFlowContent() {
  const { t } = useTranslation();
  const testsContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic catalog state (default to parsed list of 1940 tests)
  const [tests, setTests] = useState<any[]>(localTests);
  const [packages, setPackages] = useState<any[]>(LOCAL_PACKAGES);

  // Cart & Booking Flow States
  const { cart, addToCart, removeFromCart, bookingType, setBookingType, clearCart } = useCart();
  const [bookingStep, setBookingStep] = useState(0); // 0: Cart, 1: Details, 2: Slots, 3: Payment, 4: Success
  const [activeTestDetails, setActiveTestDetails] = useState<any>(null);

  const nonHomeCollectionItems = React.useMemo(() => {
    return cart.filter(item => {
      if (item.type === "package") {
        if (Array.isArray(item.tests)) {
          const pkgTests = tests.filter(t => item.tests.includes(t.id) || item.tests.includes(t.slug));
          return pkgTests.some(t => {
            const homeAvailable = t.home_collection_available !== undefined
              ? t.home_collection_available
              : (t.home_collection !== undefined ? t.home_collection : true);
            return !homeAvailable;
          });
        }
        return false;
      }
      const homeAvailable = item.home_collection_available !== undefined
        ? item.home_collection_available
        : (item.home_collection !== undefined ? item.home_collection : true);
      return !homeAvailable;
    });
  }, [cart, tests]);


  // Browser back gesture & SPA routing synchronization states
  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.history.state?.step === undefined) {
        window.history.replaceState({ step: 0 }, "", "?step=0");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    const currentHistoryStep = window.history.state?.step;
    if (currentHistoryStep !== bookingStep) {
      window.history.pushState({ step: bookingStep }, "", `?step=${bookingStep}`);
    }
  }, [bookingStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      const stateStep = event.state?.step;
      if (stateStep !== undefined && stateStep >= 0 && stateStep <= 4) {
        isPopStateRef.current = true;
        setBookingStep(stateStep);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const [patientDetails, setPatientDetails] = useState({
    fullName: "",
    phone: "",
    secondaryPhone: "",
    gender: "",
    age: ""
  });
  const [addressDetails, setAddressDetails] = useState({
    houseNumber: "",
    landmark: "",
    area: "",
    pincode: ""
  });
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return;
    }
    setGpsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            {
              headers: {
                "User-Agent": "VickyDiagnostics/1.0"
              }
            }
          );
          if (!response.ok) throw new Error("Failed to reverse-geocode coordinates.");
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const house = addr.house_number || addr.road || addr.neighbourhood || "";
            const areaName = addr.suburb || addr.city || addr.town || addr.village || addr.county || "";
            const postcodeVal = addr.postcode || "";
            
            setAddressDetails(prev => ({
              ...prev,
              houseNumber: house || prev.houseNumber,
              area: areaName || prev.area,
              pincode: postcodeVal || prev.pincode,
              landmark: prev.landmark ? `${prev.landmark} [GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]` : `[GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]`
            }));
          } else {
            setAddressDetails(prev => ({
              ...prev,
              landmark: prev.landmark ? `${prev.landmark} [GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]` : `[GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]`
            }));
          }
        } catch (err: any) {
          console.error(err);
          setAddressDetails(prev => ({
            ...prev,
            landmark: prev.landmark ? `${prev.landmark} [GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]` : `[GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]`
          }));
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Automatically request location access when user enters Home Collection Address step
  useEffect(() => {
    if (bookingStep === 1 && bookingType === "HOME_COLLECTION") {
      handleUseCurrentLocation();
    }
  }, [bookingStep, bookingType]);
  
  // Search and Filter States for Step 1
  const [testSearch, setTestSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  // Slot states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsData, setSlotsData] = useState<{ time: string; state: string }[]>([]);

  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Calendar helpers
  const getDaysInMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const formatDateString = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isDateDisabled = (d: Date | null) => {
    if (!d) return true;
    if (d.getDay() === 0) return true; // Closed Sundays
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    if (compareDate < today) return true;
    return false;
  };

  const getFirstAvailableDate = () => {
    const now = new Date();
    let testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i < 90; i++) {
      if (!isDateDisabled(testDate)) {
        return formatDateString(testDate);
      }
      testDate.setDate(testDate.getDate() + 1);
    }
    return formatDateString(now);
  };

  // Checkout payment options & status
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Handle URL query parameters to preset booking type
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");
  const searchParamQuery = searchParams.get("search");
  const concernParam = searchParams.get("concern");
  const filterParam = searchParams.get("filter");

  useEffect(() => {
    if (filterParam === "packages") {
      setActiveFilter("PACKAGES");
    }
  }, [filterParam]);

  useEffect(() => {
    if (initialType === "HOME_COLLECTION") {
      setBookingType("HOME_COLLECTION");
    } else {
      setBookingType("LAB_VISIT");
    }
  }, [initialType, setBookingType]);

  useEffect(() => {
    if (searchParamQuery) {
      setTestSearch(searchParamQuery);
    }
  }, [searchParamQuery]);

  useEffect(() => {
    if (concernParam) {
      const concernMap: { [key: string]: string } = {
        heart: "lipid",
        diabetes: "glucose",
        thyroid: "thyroid",
        kidney: "creatinine",
        liver: "lft",
        bone: "vitamin d",
        fullbody: "checkup"
      };
      const keyword = concernMap[concernParam.toLowerCase()];
      if (keyword) {
        setTestSearch(keyword);
      }
    }
  }, [concernParam]);

  const fetchCatalog = async () => {
    try {
      const testsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/catalog/tests");
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        if (testsData && testsData.length > 0) {
          const formatted = testsData.map((item: any) => ({
            ...item,
            price: Number(item.price) || 0,
            discount_price: item.discount_price ? Number(item.discount_price) : undefined,
            home_collection: item.home_collection_available !== undefined ? item.home_collection_available : item.home_collection,
            preparation: item.preparation_required !== undefined ? item.preparation_required : item.preparation
          }));
          setTests(formatted);
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
    }
  };

  // Load Razorpay script & fetch initial catalog
  useEffect(() => {
    fetchCatalog();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Filtered and sorted list of tests (sorted in alphabetical order)
  const filteredTests = useMemo(() => {
    let result = [...tests];
    
    // Filter by Category
    if (activeFilter === "BLOOD") {
      result = result.filter(t => t.sample_type === "Blood");
    } else if (activeFilter === "URINE") {
      result = result.filter(t => t.sample_type === "Urine" || t.sample_type === "Stool");
    } else if (activeFilter === "RADIOLOGY") {
      result = result.filter(t => t.sample_type === "Radiology");
    }

    // Filter by Search Query with Fuzzy Synonym Matching (Apollo/Aarthi style)
    if (testSearch.trim() !== "") {
      const query = testSearch.toLowerCase().trim();
      
      // Define synonyms list
      const synonymGroups = [
        ["sugar", "glucose", "hba1c", "fbs", "ppbs", "insulin", "diabetes"],
        ["kidney", "renal", "creatinine", "urea", "uric", "rft", "kft"],
        ["liver", "lft", "bilirubin", "sgot", "sgpt", "albumin"],
        ["heart", "lipid", "cholesterol", "triglyceride", "ecg", "cardiac", "hdl", "ldl", "crp"],
        ["bone", "vitamin d", "calcium", "joints", "ra factor", "rheumatoid"],
        ["vitamin", "vit", "cholecalciferol", "b12", "folate", "d3"]
      ];

      // Find if query matches any synonym group
      const matchingGroup = synonymGroups.find(group => group.includes(query));
      
      result = result.filter(t => {
        const testName = t.name.toLowerCase();
        
        // If query is part of a synonym group, match any term in that group
        if (matchingGroup) {
          return matchingGroup.some(term => testName.includes(term));
        }
        
        // Default standard match
        return testName.includes(query);
      });
    }

    // Sort Alphabetically
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [tests, activeFilter, testSearch]);

  const filteredPackages = useMemo(() => {
    let result = [...packages];
    if (testSearch.trim() !== "") {
      const q = testSearch.toLowerCase().trim();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return result;
  }, [packages, testSearch]);

  const getTestIds = () => {
    const ids: string[] = [];
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const localIdMap: { [key: string]: string } = {
      "t1": "cbc",
      "t2": "vitamin-d",
      "t3": "thyroid-profile",
      "t4": "lft"
    };

    cart.forEach(item => {
      if (item.type === "test" || !item.type) {
        if (isUUID(item.id)) {
          ids.push(item.id);
        } else {
          // Fallback: Find matching test in catalog by slug or name
          const match = tests.find(t => t.slug === item.slug || t.name === item.name);
          if (match && isUUID(match.id)) {
            ids.push(match.id);
          }
        }
      } else if (item.type === "package") {
        if (Array.isArray(item.tests)) {
          item.tests.forEach((t: any) => {
            let testId = typeof t === "string" ? t : t.id;
            // Resolve local fallback IDs like t1, t3, t4 to slugs
            if (localIdMap[testId]) {
              testId = localIdMap[testId];
            }
            
            if (isUUID(testId)) {
              ids.push(testId);
            } else {
              // Find test by ID, slug, or matching name
              const match = tests.find(dbT => dbT.id === testId || dbT.slug === testId || dbT.name.toLowerCase() === testId.toLowerCase());
              if (match && isUUID(match.id)) {
                ids.push(match.id);
              }
            }
          });
        }
      }
    });

    // Fallback: if list is empty but cart has items, try to find matching UUIDs from tests
    if (ids.length === 0 && cart.length > 0) {
      cart.forEach(item => {
        const match = tests.find(t => t.name.toLowerCase() === item.name.toLowerCase() || t.slug === item.slug);
        if (match && isUUID(match.id)) {
          ids.push(match.id);
        }
      });
    }

    return Array.from(new Set(ids));
  };

  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    setCheckoutError("");
    try {
      const branchId = tests[0]?.branch_id || "da4ff965-f9be-4ff2-8d7b-cbff246e7f8e";
      const slotTimeISO = `${selectedDate}T${selectedSlot}:00`;
      
      const payload = {
        branch_id: branchId,
        booking_type: bookingType,
        slot_time: slotTimeISO,
        test_ids: getTestIds(),
        patient: {
          full_name: patientDetails.fullName,
          phone: patientDetails.phone,
          secondary_phone: patientDetails.secondaryPhone || null,
          gender: patientDetails.gender,
          age: parseInt(patientDetails.age, 10)
        },
        house_number: bookingType === "HOME_COLLECTION" ? addressDetails.houseNumber : null,
        landmark: bookingType === "HOME_COLLECTION" ? addressDetails.landmark : null,
        area: bookingType === "HOME_COLLECTION" ? addressDetails.area : null,
        pincode: bookingType === "HOME_COLLECTION" ? addressDetails.pincode : null,
        payment_method: paymentMethod
      };

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create booking.");
      }

      const bookingData = await res.json();
      setCreatedBooking(bookingData);

      if (paymentMethod === "CASH") {
        setBookingStep(4);
      } else {
        const orderId = bookingData.razorpay_order_id;
        const keyId = bookingData.razorpay_key_id;

        // If order ID is mock or Razorpay SDK is unavailable, simulate successful payment locally
        if (!orderId || orderId.startsWith("order_mock_") || !(window as any).Razorpay) {
          try {
            const verifyRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/bookings/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: orderId || ("order_mock_" + Math.random().toString(36).substring(7)),
                razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
                razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7)
              })
            });
            if (verifyRes.ok) {
              setBookingStep(4);
            } else {
              const verifyErr = await verifyRes.json();
              setCheckoutError(verifyErr.detail || "Mock payment verification failed on server.");
            }
          } catch (err: any) {
            setCheckoutError("Payment simulation error: " + err.message);
          }
          return;
        }

        const options = {
          key: keyId || "rzp_test_czBKlGgeUDEZqM",
          amount: Math.round(bookingData.total_amount * 100),
          currency: "INR",
          name: "Vicky Diagnostics",
          description: "Payment for Diagnostic Booking",
          order_id: orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/bookings/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              if (verifyRes.ok) {
                setBookingStep(4);
              } else {
                const verifyErr = await verifyRes.json();
                setCheckoutError(verifyErr.detail || "Payment verification failed.");
              }
            } catch (err: any) {
              setCheckoutError("Error verifying payment signature: " + err.message);
            }
          },
          prefill: {
            name: patientDetails.fullName,
            contact: patientDetails.phone
          },
          theme: {
            color: "#1A6BBF"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setCheckoutError("Payment failed: " + response.error.description);
        });
        rzp.open();
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to secure booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSlots = async (dateStr: string) => {
    try {
      const branchId = tests[0]?.branch_id || "da4ff965-f9be-4ff2-8d7b-cbff246e7f8e";
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/bookings/check-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          booking_type: bookingType,
          target_date: dateStr
        })
      });
      if (res.ok) {
        return await res.json();
      } else {
        console.log("Backend check-slots returned non-ok status:", res.status);
        return null;
      }
    } catch (err) {
      console.log("Error checking slots on backend:", err);
    }
    return null;
  };

  const handleDateChange = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot("");
    setIsLoadingSlots(true);

    try {
      const backendSlots = await fetchSlots(dateStr);
      const times = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
      
      let finalSlots: { time: string; state: string }[] = [];

      if (backendSlots && Array.isArray(backendSlots)) {
        finalSlots = backendSlots.map((s: any) => ({
          time: s.slot_time,
          state: s.available ? s.capacity_level : "FULL"
        }));
      } else {
        const states = times.map(() => "AVAILABLE");
        finalSlots = times.map((t, idx) => ({ time: t, state: states[idx] }));
      }

      // Filter slots for current day
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      if (dateStr === todayStr) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        finalSlots = finalSlots.filter(s => {
          const [sh, sm] = s.time.split(":").map(Number);
          return (sh > currentHour) || (sh === currentHour && sm >= currentMinute);
        });
      }

      setSlotsData(finalSlots);
    } catch (err) {
      console.error("Error checking slots:", err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((acc, curr) => {
      const priceVal = (curr.discount_price !== undefined && curr.discount_price !== null) 
        ? Number(curr.discount_price) 
        : Number(curr.price);
      const val = isNaN(priceVal) ? 0 : priceVal;
      return acc + val;
    }, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    if (bookingType === "HOME_COLLECTION") {
      return subtotal + 100;
    }
    return subtotal;
  };

  // Scroll handler for A-Z sidebar
  const scrollToLetter = (letter: string) => {
    const container = testsContainerRef.current;
    if (!container) return;

    let el = document.getElementById(`letter-group-${letter.toLowerCase()}`);
    if (!el) {
      // Find the closest next letter that has a group
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const startIndex = alphabet.indexOf(letter.toLowerCase());
      for (let i = startIndex + 1; i < alphabet.length; i++) {
        const nextEl = document.getElementById(`letter-group-${alphabet[i]}`);
        if (nextEl) {
          el = nextEl;
          break;
        }
      }
    }

    if (el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const relativeTop = elRect.top - containerRect.top + container.scrollTop - 10;
      container.scrollTo({ top: relativeTop, behavior: "smooth" });
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <section id="booking" className="scroll-mt-20 border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            🧪 Diagnostic Booking System
          </h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className={`px-2 py-1 rounded-full ${bookingStep >= 0 ? "bg-primary text-white" : "bg-slate-200"}`}>
              1. Cart
            </span>
            <span>&rarr;</span>
            <span className={`px-2 py-1 rounded-full ${bookingStep >= 1 ? "bg-primary text-white" : "bg-slate-200"}`}>
              2. Details
            </span>
            <span>&rarr;</span>
            <span className={`px-2 py-1 rounded-full ${bookingStep >= 2 ? "bg-primary text-white" : "bg-slate-200"}`}>
              3. Slot
            </span>
            <span>&rarr;</span>
            <span className={`px-2 py-1 rounded-full ${bookingStep >= 3 ? "bg-primary text-white" : "bg-slate-200"}`}>
              4. Pay
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Main Interactive Flow Panel */}
          <div className="lg:col-span-2 p-6 min-h-[400px]">
            
            {/* STEP 1: CART LIST */}
            {bookingStep === 0 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="relative w-full md:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Search tests..."
                      value={testSearch}
                      onChange={(e) => setTestSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full text-sm border border-slate-300 rounded-md focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {["ALL", "BLOOD", "URINE", "RADIOLOGY", "PACKAGES"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-standard cursor-pointer ${
                          activeFilter === filter
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {filter === "ALL" && "All Tests"}
                        {filter === "BLOOD" && "Blood"}
                        {filter === "URINE" && "Urine/Stool"}
                        {filter === "RADIOLOGY" && "Radiology & Scans"}
                        {filter === "PACKAGES" && "Wellness Packages"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {activeFilter === "PACKAGES" 
                    ? `${filteredPackages.length} packages available` 
                    : `${filteredTests.length} tests available`}
                </div>

                {/* A-Z INDEX SIDEBAR GRID CONTAINER */}
                <div className="flex gap-4 relative">
                  <div
                    ref={testsContainerRef}
                    className="flex-1 min-w-0 max-h-[70vh] overflow-y-auto pr-4 border border-slate-100 rounded-lg p-3 bg-slate-50/10"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeFilter === "PACKAGES" ? (
                        filteredPackages.map(pkg => {
                          const inCart = cart.find(c => c.id === pkg.id);
                          return (
                            <div key={pkg.id} className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all duration-300 bg-white">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                                    Wellness Package
                                  </span>
                                  {pkg.discount_price && (
                                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                      Save {Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100)}%
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm hover:text-primary transition-standard leading-tight line-clamp-2 min-h-[2.5rem]">
                                  {pkg.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {pkg.description || "Comprehensive checkup containing selected diagnostic parameters at a bundle discount."}
                                </p>
                              </div>
                              <div className="pt-3 flex justify-between items-center border-t border-slate-100 mt-4">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-sm font-bold text-slate-900">₹{pkg.discount_price || pkg.price}</span>
                                  {pkg.discount_price && (
                                    <span className="text-[10px] text-slate-400 line-through">₹{pkg.price}</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => inCart ? removeFromCart(pkg.id) : addToCart({ ...pkg, type: "package" })}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-standard interactive-target cursor-pointer ${
                                    inCart ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-primary text-white hover:bg-primary-hover"
                                  }`}
                                >
                                  {inCart ? "Remove" : "+ Add"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        (() => {
                          let lastLetter = "";
                          return filteredTests.map(test => {
                            const firstChar = test.name.charAt(0).toUpperCase();
                            const firstLetter = (firstChar >= 'A' && firstChar <= 'Z') ? firstChar : '#';
                            const showHeader = (firstLetter !== lastLetter) && (firstLetter !== '#');
                            if (showHeader) {
                              lastLetter = firstLetter;
                            }
                            const inCart = cart.find(c => c.id === test.id);
                            return (
                              <React.Fragment key={test.id}>
                                {showHeader && (
                                  <div
                                    id={`letter-group-${firstLetter.toLowerCase()}`}
                                    className="col-span-full border-b border-slate-200 pb-1 pt-4 text-lg font-extrabold text-primary flex items-center scroll-mt-2"
                                  >
                                    <span className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center mr-2 text-sm font-black">
                                      {firstLetter}
                                    </span>
                                    {firstLetter}
                                  </div>
                                )}
                                <div className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all duration-300 bg-white">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                                      {test.sample_type} test
                                    </span>
                                    <h4 className="font-bold text-slate-800 text-sm hover:text-primary transition-standard leading-tight line-clamp-2 min-h-[2.5rem]">
                                      {test.name}
                                    </h4>
                                    <button
                                      onClick={() => setActiveTestDetails(test)}
                                      className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 mt-2 focus:outline-none group/btn transition-colors cursor-pointer"
                                    >
                                      <span>View More & Prep</span>
                                      <span className="transition-transform group-hover/btn:translate-x-0.5">&rarr;</span>
                                    </button>
                                  </div>
                                  <div className="pt-3 flex justify-between items-center border-t border-slate-100 mt-4">
                                    <span className="text-sm font-bold text-slate-900">₹{test.price}</span>
                                    <button
                                      onClick={() => inCart ? removeFromCart(test.id) : addToCart({ ...test, type: "test" })}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-standard interactive-target cursor-pointer ${
                                        inCart ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-primary text-white hover:bg-primary-hover"
                                      }`}
                                    >
                                      {inCart ? "Remove" : "+ Add"}
                                    </button>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          });
                        })()
                      )}
                    </div>

                    {activeFilter === "PACKAGES" ? (
                      filteredPackages.length === 0 && (
                        <div className="text-center col-span-full py-12 text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                          No packages found matching your search query.
                        </div>
                      )
                    ) : (
                      filteredTests.length === 0 && (
                        <div className="text-center col-span-full py-12 text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                          No tests found matching your search query.
                        </div>
                      )
                    )}
                  </div>

                  {/* A-Z ALPHABET INDEX SIDEBAR */}
                  <div className="hidden sm:flex flex-col items-center justify-between select-none shrink-0 z-40 sm:sticky sm:top-0 sm:h-[70vh] sm:w-8 sm:text-[11px] sm:border-0 sm:border-l sm:border-slate-200 sm:bg-white sm:shadow-none sm:rounded-none sm:py-3 sm:px-2">
                    {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter => (
                      <button
                        key={letter}
                        onClick={() => scrollToLetter(letter)}
                        className="hover:text-accent hover:bg-primary/10 rounded w-full h-[2.5vh] flex items-center justify-center transition-all cursor-pointer font-bold text-primary"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Redundant action button removed since it is present in the sticky sidebar */}
              </div>
            )}

            {/* STEP 2: PATIENT DETAILS */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("booking.collection_type")}</h4>
                  <div className="inline-flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => setBookingType("LAB_VISIT")}
                      className={`px-4 py-2.5 text-xs font-bold rounded-l-md border transition-all cursor-pointer ${
                        bookingType === "LAB_VISIT"
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      🏥 {t("booking.lab_visit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType("HOME_COLLECTION")}
                      className={`px-4 py-2.5 text-xs font-bold rounded-r-md border-y border-r transition-all cursor-pointer ${
                        bookingType === "HOME_COLLECTION"
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      🏠 {t("booking.home_collection")}
                    </button>
                  </div>
                </div>

                {bookingType === "HOME_COLLECTION" && nonHomeCollectionItems.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-850 text-xs font-bold rounded-lg space-y-2">
                    <p className="flex items-center gap-2 text-sm text-red-900 font-extrabold">
                      <span>⚠️</span> Home Collection Unavailable
                    </p>
                    <p className="font-normal text-red-700 leading-relaxed">
                      The following test(s) in your cart cannot be collected at home:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {nonHomeCollectionItems.map(item => (
                        <li key={item.id} className="font-bold">{item.name}</li>
                      ))}
                    </ul>
                    <p className="font-normal text-red-700 leading-relaxed pt-1">
                      Please switch the collection type to **🏥 Lab Visit** or remove these tests from your cart to proceed.
                    </p>
                  </div>
                )}

                <h3 className="font-bold text-slate-800">Enter Patient Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={patientDetails.fullName}
                      onChange={(e) => setPatientDetails({ ...patientDetails, fullName: e.target.value })}
                      className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone *</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={patientDetails.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPatientDetails({ ...patientDetails, phone: val });
                      }}
                      className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Age *</label>
                    <input
                      type="number"
                      value={patientDetails.age}
                      onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                      className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Gender *</label>
                    <select
                      value={patientDetails.gender}
                      onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value })}
                      className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white focus:border-primary focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {bookingType === "HOME_COLLECTION" && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-800">Home Collection Address</h4>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={gpsLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-md shadow-sm transition-all focus:outline-none disabled:opacity-50 cursor-pointer self-start"
                      >
                        {gpsLoading ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Fetching Location...</span>
                          </>
                        ) : (
                          <>
                            <span>📍</span>
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">{t("booking.house_number")} *</label>
                        <input
                          type="text"
                          required
                          value={addressDetails.houseNumber}
                          onChange={(e) => setAddressDetails({ ...addressDetails, houseNumber: e.target.value })}
                          className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">{t("booking.landmark")}</label>
                        <input
                          type="text"
                          value={addressDetails.landmark}
                          onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                          className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">{t("booking.area")} *</label>
                        <input
                          type="text"
                          required
                          value={addressDetails.area}
                          onChange={(e) => setAddressDetails({ ...addressDetails, area: e.target.value })}
                          className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">{t("booking.pincode")} *</label>
                        <input
                          type="text"
                          required
                          value={addressDetails.pincode}
                          onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                          className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-primary focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && window.history.state?.step !== undefined) {
                        window.history.back();
                      } else {
                        setBookingStep(0);
                      }
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-standard"
                  >
                    &larr; Back to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (!patientDetails.fullName || !patientDetails.phone || !patientDetails.age || !patientDetails.gender) {
                        alert("Please fill in all required patient details.");
                        return;
                      }
                      if (patientDetails.phone.length !== 10 || !/^\d{10}$/.test(patientDetails.phone)) {
                        alert("Please enter a valid 10-digit mobile number.");
                        return;
                      }
                      if (bookingType === "HOME_COLLECTION") {
                        if (nonHomeCollectionItems.length > 0) {
                          alert("Home Collection is not available for some tests in your cart. Please switch to 'Lab Visit' or remove those tests.");
                          return;
                        }
                        if (!addressDetails.houseNumber || !addressDetails.area || !addressDetails.pincode) {
                          alert("Please fill in all required address fields for home collection.");
                          return;
                        }
                      }
                      const firstDate = getFirstAvailableDate();
                      setBookingStep(2);
                      handleDateChange(firstDate);
                    }}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-md transition-standard interactive-target"
                  >
                    Select Time Slot &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SLOT CALENDAR & CAPACITY METERS */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <h3 className="font-bold text-slate-800">Select Date & Time</h3>
                
                {/* CALENDAR VIEW */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 max-w-md mx-auto sm:mx-0 shadow-sm">
                  {/* Calendar Navigation Header */}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMonth(prev => {
                          const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
                          const now = new Date();
                          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                          if (newMonth < startOfMonth) return prev;
                          return newMonth;
                        });
                      }}
                      className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-700 font-bold"
                      disabled={
                        currentMonth.getFullYear() === new Date().getFullYear() &&
                        currentMonth.getMonth() === new Date().getMonth()
                      }
                    >
                      &larr;
                    </button>
                    <span className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                      {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                      }}
                      className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 font-bold"
                    >
                      &rarr;
                    </button>
                  </div>

                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((d, index) => {
                      if (!d) {
                        return <div key={`empty-${index}`} />;
                      }
                      
                      const dStr = formatDateString(d);
                      const isDisabled = isDateDisabled(d);
                      const isSelected = selectedDate === dStr;
                      const isToday = formatDateString(new Date()) === dStr;
                      
                      return (
                        <button
                          key={dStr}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleDateChange(dStr)}
                          className={`h-9 w-9 text-xs font-bold rounded-lg flex flex-col items-center justify-center transition-all relative interactive-target ${
                            isDisabled ? "bg-slate-50 text-slate-300 line-through cursor-not-allowed" :
                            isSelected ? "bg-primary text-white shadow-sm border border-primary font-black" :
                            isToday ? "border border-primary text-primary bg-primary/5 hover:bg-primary/10" :
                            "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          <span>{d.getDate()}</span>
                          {isToday && !isSelected && (
                            <span className="absolute bottom-1 h-1 w-1 bg-primary rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Slots for {selectedDate}</span>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-100 border border-slate-300"></span> Full</span>
                        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-100 border border-amber-300"></span> Filling Fast</span>
                      </div>
                    </div>

                    {isLoadingSlots ? (
                      <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 border border-slate-200 border-dashed rounded-lg">
                        <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span className="text-xs text-slate-500 mt-2 font-medium">Checking slot capacities...</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                          {slotsData.map(slot => {
                            const isFull = slot.state === "FULL";
                            const isFilling = slot.state === "FILLING_FAST";
                            return (
                              <button
                                key={slot.time}
                                disabled={isFull}
                                onClick={() => setSelectedSlot(slot.time)}
                                className={`p-2.5 text-xs font-bold border rounded-md text-center transition-standard relative interactive-target ${
                                  isFull ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" :
                                  isFilling && selectedSlot !== slot.time ? "border-amber-300 bg-amber-50/50 text-amber-800 hover:bg-amber-50" :
                                  selectedSlot === slot.time ? "border-primary bg-primary text-white shadow-sm" :
                                  "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                {slot.time}
                                {isFilling && (
                                  <span className="absolute -top-1.5 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {slotsData.length === 0 && (
                          <p className="text-sm text-amber-600 font-semibold italic text-center py-4 bg-amber-50/30 border border-amber-100 rounded-lg">
                            ⚠️ No slots available for the selected date.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && window.history.state?.step !== undefined) {
                        window.history.back();
                      } else {
                        setBookingStep(1);
                      }
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-standard"
                  >
                    &larr; Back to Details
                  </button>
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setBookingStep(3)}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-md transition-standard disabled:opacity-50 disabled:cursor-not-allowed interactive-target"
                  >
                    Proceed to Checkout &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CHECKOUT / RAZORPAY INTEGRATION */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-bold text-slate-800">Reconcile & Secure Payment</h3>
                <p className="text-sm text-slate-600">
                  Your appointment is scheduled for <strong className="text-primary">{selectedDate} at {selectedSlot}</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 divide-y divide-slate-200 space-y-4">
                  <div className="pb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Summary</h4>
                    <p className="text-sm font-bold text-slate-800 mt-1">{patientDetails.fullName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{patientDetails.gender}, {patientDetails.age} Years · {patientDetails.phone}</p>
                  </div>

                  {bookingType === "HOME_COLLECTION" && (
                    <div className="py-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Home Collection Address</h4>
                      <p className="text-xs text-slate-700 mt-1">
                        {addressDetails.houseNumber}, {addressDetails.landmark ? `${addressDetails.landmark}, ` : ""}{addressDetails.area} - {addressDetails.pincode}
                      </p>
                    </div>
                  )}

                  <div className="pt-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Option</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-standard">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "RAZORPAY"}
                          onChange={() => setPaymentMethod("RAZORPAY")}
                          className="text-primary"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Pay Online
                          </p>
                          <p className="text-xs text-slate-500">Supports cards, UPI, netbanking, wallets.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-standard">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "CASH"}
                          onChange={() => setPaymentMethod("CASH")}
                          className="text-primary"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Pay Cash at Diagnostics Centre
                          </p>
                          <p className="text-xs text-slate-500">Reconcile transaction offline upon sample collection.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {paymentMethod === "RAZORPAY" && (
                  <div className="space-y-4">
                    {/* Dummy Test Credentials Panel */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-3 shadow-sm">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span>💳</span> Razorpay Test Credentials (for Gateway popup)
                      </p>
                      <p className="text-[11px] text-slate-505 leading-relaxed">
                        When the Razorpay secure checkout window opens, choose <strong>Card</strong> and enter these credentials to simulate a successful payment:
                      </p>
                      <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs shadow-inner">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Card Number</span>
                          <strong className="text-slate-800 tracking-wider">4111 1111 1111 1111</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Expiry Date</span>
                          <strong className="text-slate-800">12 / 30</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">CVV</span>
                          <strong className="text-slate-800">123</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">OTP / 3D Secure</span>
                          <strong className="text-slate-800">Any 6 digits</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bypass option */}
                    <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 flex flex-col items-center gap-2.5 shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <span>💡</span>
                        <span>Sandbox / Demo Mode Active</span>
                      </div>
                    <p className="text-[11px] text-blue-700 max-w-md">
                      If the Razorpay popup is blocked by browser extensions, or if you want to bypass entering test payment credentials, click the button below to instantly complete a simulated successful payment.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSubmitting(true);
                        setCheckoutError("");
                        try {
                          const branchId = tests[0]?.branch_id || "da4ff965-f9be-4ff2-8d7b-cbff246e7f8e";
                          const slotTimeISO = `${selectedDate}T${selectedSlot}:00`;
                          const payload = {
                            branch_id: branchId,
                            booking_type: bookingType,
                            slot_time: slotTimeISO,
                            test_ids: getTestIds(),
                            patient: {
                              full_name: patientDetails.fullName,
                              phone: patientDetails.phone,
                              secondary_phone: patientDetails.secondaryPhone || null,
                              gender: patientDetails.gender,
                              age: parseInt(patientDetails.age, 10)
                            },
                            house_number: bookingType === "HOME_COLLECTION" ? addressDetails.houseNumber : null,
                            landmark: bookingType === "HOME_COLLECTION" ? addressDetails.landmark : null,
                            area: bookingType === "HOME_COLLECTION" ? addressDetails.area : null,
                            pincode: bookingType === "HOME_COLLECTION" ? addressDetails.pincode : null,
                            payment_method: "RAZORPAY"
                          };

                          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/bookings/", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                          });

                          if (!res.ok) {
                            let detailedMsg = "Failed to create booking.";
                            try {
                              const errorData = await res.json();
                              if (errorData && errorData.detail) {
                                detailedMsg = typeof errorData.detail === "string" 
                                  ? errorData.detail 
                                  : JSON.stringify(errorData.detail);
                              }
                            } catch (jsonErr) {}
                            throw new Error(detailedMsg);
                          }

                          const bookingData = await res.json();
                          const orderId = bookingData.razorpay_order_id || ("order_mock_" + Math.random().toString(36).substring(7));
                          setCreatedBooking(bookingData);

                          // Force mock verification call
                          const verifyRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/bookings/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              razorpay_order_id: orderId,
                              razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
                              razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7)
                            })
                          });
                          
                          if (verifyRes.ok) {
                            setBookingStep(4);
                          } else {
                            throw new Error("Mock verification failed.");
                          }
                        } catch (err: any) {
                          setCheckoutError("Direct simulation failed: " + err.message);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded text-xs transition-standard cursor-pointer shadow-sm interactive-target"
                    >
                      Bypass & Pay Instantly (Simulate Success)
                    </button>
                  </div>
                  </div>
                )}

                {checkoutError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg leading-relaxed animate-in fade-in duration-200">
                    ⚠️ {checkoutError}
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <button
                    disabled={isSubmitting}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.history.state?.step !== undefined) {
                        window.history.back();
                      } else {
                        setBookingStep(2);
                      }
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-standard disabled:opacity-50"
                  >
                    &larr; Back to Calendar
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleConfirmAndPay}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow-md transition-standard interactive-target disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing Booking...
                      </>
                    ) : (
                      "🔒 Securely Confirm Booking & Pay"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS RECEIPT */}
            {bookingStep === 4 && (
              <div className="text-center py-8 space-y-6 animate-in zoom-in duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">Booking Confirmed Successfully!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for choosing Vicky Diagnostics. Your transaction has been reconciled. A confirmation text has been triggered.
                  </p>
                </div>

                <div className="max-w-md mx-auto border border-green-200 bg-emerald-50/50 rounded-xl p-4 text-left space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 border-b border-green-100 pb-2">
                    <span className="text-lg">💬</span>
                    <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">WhatsApp Receipt Preview</h4>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    <p>Dear <strong>{patientDetails.fullName}</strong>,</p>
                    <p>
                      Your booking at <strong>Vicky Diagnostics</strong> is confirmed.
                    </p>
                    {createdBooking && (
                      <p><strong>Booking ID:</strong> <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{createdBooking.id}</span></p>
                    )}
                    {bookingType === "HOME_COLLECTION" && (
                      <>
                        <p><strong>Booking Type:</strong> Home Sample Collection</p>
                        <p><strong>Collector:</strong> {createdBooking?.assigned_phlebotomist || "Home Collector Team"} ({PHLEBOTOMIST_CONTACTS[createdBooking?.assigned_phlebotomist || "Home Collector Team"] || "+91 93981 75183"})</p>
                      </>
                    )}
                    <p><strong>Service:</strong> {cart.map(c => c.name).join(", ")}</p>
                    <p><strong>Date:</strong> {selectedDate}</p>
                    <p><strong>Time:</strong> {selectedSlot}</p>
                    <p className="text-[10px] text-slate-505 mt-2">
                      Tracking links: <span className="underline cursor-pointer">View Booking</span> | <span className="underline cursor-pointer">Get Directions</span> | <a href="tel:9398175183" className="underline font-bold text-primary">Call Center (+91 93981 75183)</a>
                    </p>
                  </div>
                </div>

                {bookingType === "HOME_COLLECTION" && (
                  <div className="max-w-md mx-auto border border-blue-200 bg-blue-50/50 rounded-xl p-4 text-left space-y-2 shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                      <span className="text-lg">🛵</span>
                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Assigned Phlebotomist Info</h4>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1.5 font-semibold">
                      <p><strong>Name:</strong> <span className="text-slate-900">{createdBooking?.assigned_phlebotomist || "Home Collector Team"}</span></p>
                      <p><strong>Contact Number:</strong> <a href={`tel:${(PHLEBOTOMIST_CONTACTS[createdBooking?.assigned_phlebotomist || "Home Collector Team"] || "+91 93981 75183").replace(/\s+/g, "")}`} className="text-primary font-black hover:underline">{PHLEBOTOMIST_CONTACTS[createdBooking?.assigned_phlebotomist || "Home Collector Team"] || "+91 93981 75183"}</a></p>
                      <p className="text-[10px] text-slate-550 font-normal leading-relaxed">
                        Please contact your phlebotomist for collection arrival coordination and timing updates.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => {
                      clearCart();
                      setSelectedSlot("");
                      setSelectedDate("");
                      setCreatedBooking(null);
                      if (typeof window !== "undefined") {
                        window.history.replaceState({ step: 0 }, "", "?step=0");
                      }
                      setBookingStep(0);
                    }}
                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-md transition-standard interactive-target"
                  >
                    Book Another Test
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* STICKY CART SUMMARY / SIDEBAR */}
          <div className="p-6 bg-slate-50 space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
              <span>{t("booking.cart_summary")}</span>
              <span className="px-2 py-0.5 bg-slate-200 rounded-full text-xs text-slate-600">
                {cart.length}
              </span>
            </h3>

            {cart.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 text-xs">
                      <div className="pr-4">
                        <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{item.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          ₹{item.discount_price || item.price}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 font-bold px-1 interactive-target cursor-pointer"
                          aria-label="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-bold text-slate-800">₹{getSubtotal()}</span>
                  </div>
                  {bookingType === "HOME_COLLECTION" && (
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>Home Collection Charge:</span>
                      <span>₹100</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                    <span>Total:</span>
                    <span>₹{getTotal()}</span>
                  </div>
                </div>
                {bookingStep === 0 && (
                  <button
                    onClick={() => setBookingStep(1)}
                    className="w-full mt-4 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-extrabold rounded-md shadow transition-standard text-center text-sm cursor-pointer interactive-target animate-bounce"
                  >
                    Enter Patient Details &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No tests selected yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Test Details Modal */}
      {activeTestDetails && (() => {
        const details = generateTestDetails(activeTestDetails);
        if (!details) return null;
        const inCart = cart.find(c => c.id === activeTestDetails.id);

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
                      if (inCart) {
                        removeFromCart(activeTestDetails.id);
                      } else {
                        addToCart({ ...activeTestDetails, type: "test" });
                      }
                      setActiveTestDetails(null);
                    }}
                    className={`px-5 py-2 text-xs font-bold rounded-md transition-all shadow-sm cursor-pointer ${
                      inCart
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-primary text-white hover:bg-primary-hover"
                    }`}
                  >
                    {inCart ? "Remove From Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

function BookingFlow() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading booking portal...</div>}>
      <BookingFlowContent />
    </Suspense>
  );
}

export default function BookingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <BookingFlow />
      {/* Footer */}
      <Footer />
    </div>
  );
}
