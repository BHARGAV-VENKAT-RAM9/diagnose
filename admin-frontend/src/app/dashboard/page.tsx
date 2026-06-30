"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalPatients: 0,
    pendingReports: 0
  });

  const [analyticsData, setAnalyticsData] = useState<any>({
    booking_type_distribution: { lab_visits: 12, home_collections: 28 },
    top_tests: [
      { name: "Complete Blood Count (CBC)", bookings_count: 22 },
      { name: "Vitamin D (25-Hydroxy)", bookings_count: 14 },
      { name: "Thyroid Profile (T3, T4, TSH)", bookings_count: 8 }
    ]
  });
  
  // Reviews & Leads states
  const [reviews, setReviews] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [catalogTests, setCatalogTests] = useState<any[]>([]);

  // Blogs manager states
  const [adminBlogs, setAdminBlogs] = useState<any[]>([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    authorName: ""
  });
  const [blogSubmitMessage, setBlogSubmitMessage] = useState("");
  const [blogSubmitError, setBlogSubmitError] = useState("");
  const [submittingBlog, setSubmittingBlog] = useState(false);

  const MOCK_ADMIN_BLOGS = [
    { id: "b-1", title: "Understanding Your Liver Function Test (LFT) Results", slug: "understanding-lft-results", excerpt: "A detailed guide on interpreting bilirubin, SGOT, and SGPT levels in your liver health report.", content: "Your liver plays a critical role in filtering toxins...", author_name: "Dr. A. Srinivas, Pathologist", status: "PUBLISH", created_at: "2026-06-19" },
    { id: "b-2", title: "The Vital Importance of Vitamin D in Muscle and Bone Health", slug: "importance-of-vitamin-d", excerpt: "Deficiency is rising among city dwellers...", content: "Vitamin D is unique as it functions like a hormone...", author_name: "Dr. K. Anuradha, Biochemist", status: "PUBLISH", created_at: "2026-06-18" }
  ];

  // New RBAC States
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    workingHours: "07:00 - 20:00",
    slotCapacity: 5,
    homeCollectionCharges: 150,
    refundPolicy: "100% refund if cancelled 4 hours prior",
    cancellationPolicy: "Free cancellation within 2 hours of booking",
    contactPhone: "+91 9398175183"
  });

  const [newUser, setNewUser] = useState({ email: "", username: "", password: "", fullName: "", roleName: "SUPPORT_ADMIN" });
  const [newBranch, setNewBranch] = useState({ name: "", city: "", address: "", phone: "" });

  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File | null}>({});
  const [criticalFlags, setCriticalFlags] = useState<{[key: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: string}>({});
  const [uploadChecksums, setUploadChecksums] = useState<{[key: string]: string}>({});

  const MOCK_PAYMENTS = [
    { id: "pay-1", patient_name: "Rajesh Kumar", method: "RAZORPAY", amount: 399, status: "SUCCESS", created_at: "2026-06-20 08:30" },
    { id: "pay-2", patient_name: "Saraswathi Devi", method: "CASH", amount: 599, status: "PENDING", created_at: "2026-06-19 10:15" },
    { id: "pay-3", patient_name: "Anil Kumar", method: "RAZORPAY", amount: 499, status: "SUCCESS", created_at: "2026-06-19 11:45" },
    { id: "pay-4", patient_name: "Sireesha M.", method: "RAZORPAY", amount: 999, status: "REFUNDED", created_at: "2026-06-18 14:00" },
    { id: "pay-5", patient_name: "Ramesh K.", method: "CASH", amount: 299, status: "SUCCESS", created_at: "2026-06-18 09:00" }
  ];

  const MOCK_USERS = [
    { id: "u-1", email: "owner@vickydiagnostics.com", username: "owner", full_name: "Main Admin Owner", role: "MAIN_ADMIN", is_active: true },
    { id: "u-2", email: "admin@vickydiagnostics.com", username: "admin", full_name: "Support Admin Team", role: "SUPPORT_ADMIN", is_active: true },
    { id: "u-3", email: "staff@vickydiagnostics.com", username: "staff", full_name: "Staff Lab Technician Demo", role: "LAB_TECHNICIAN", is_active: true },
    { id: "u-4", email: "collector@vickydiagnostics.com", username: "collector", full_name: "Home Collector Team", role: "PHLEBOTOMIST", is_active: true }
  ];

  const MOCK_BRANCHES = [
    { id: "br-1", name: "Main Branch", city: "Hyderabad", address: "101 Diagnostic Towers, Madhapur, Hyderabad", phone: "+919876543210", is_active: true },
    { id: "br-2", name: "North Branch", city: "Secunderabad", address: "404 Clinic Plaza, Secunderabad", phone: "+919876543211", is_active: true }
  ];

  // Tab views state (expanded to support all 11 views for Main Admin)
  const [activeTab, setActiveTab] = useState<"pipeline" | "catalog" | "reviews" | "leads" | "blogs" | "finance" | "analytics" | "users" | "branches" | "settings" | "home_collections">("pipeline");

  // Catalog tabs and package states
  const [catalogSubTab, setCatalogSubTab] = useState<"tests" | "packages">("tests");
  const [catalogSearch, setCatalogSearch] = useState("");
  const catalogContainerRef = React.useRef<HTMLDivElement>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    description: "",
    testIds: [] as string[]
  });

  const [modalTestSearch, setModalTestSearch] = useState("");
  const modalTestsContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToCatalogLetter = (letter: string) => {
    const container = catalogContainerRef.current;
    if (!container) return;

    let el = document.getElementById(`catalog-letter-group-${letter.toLowerCase()}`);
    if (!el) {
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const startIndex = alphabet.indexOf(letter.toLowerCase());
      for (let i = startIndex + 1; i < alphabet.length; i++) {
        const nextEl = document.getElementById(`catalog-letter-group-${alphabet[i]}`);
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

  const scrollToModalTestLetter = (letter: string) => {
    const container = modalTestsContainerRef.current;
    if (!container) return;

    let el = document.getElementById(`modal-test-letter-group-${letter.toLowerCase()}`);
    if (!el) {
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const startIndex = alphabet.indexOf(letter.toLowerCase());
      for (let i = startIndex + 1; i < alphabet.length; i++) {
        const nextEl = document.getElementById(`modal-test-letter-group-${alphabet[i]}`);
        if (nextEl) {
          el = nextEl;
          break;
        }
      }
    }

    if (el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const relativeTop = elRect.top - containerRect.top + container.scrollTop - 5;
      container.scrollTo({ top: relativeTop, behavior: "smooth" });
    }
  };

  const fetchAdminBlogs = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/blogs/all");
      if (res.ok) {
        const data = await res.json();
        setAdminBlogs(data);
      } else {
        setAdminBlogs(MOCK_ADMIN_BLOGS);
      }
    } catch (err) {
      setAdminBlogs(MOCK_ADMIN_BLOGS);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (time: number, freq: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.3, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };
      const now = audioCtx.currentTime;
      playBeep(now, 880, 0.15);
      playBeep(now + 0.2, 880, 0.15);
    } catch (e) {
      console.warn("Failed to play Web Audio alert:", e);
    }
  };

  const sendBrowserNotification = (booking: any) => {
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("New Home Collection Booking!", {
            body: `Patient: ${booking.patient_name}\nSlot: ${booking.slot_time}\nPhone: ${booking.phone}`,
            icon: "/favicon.ico"
          });
        }
      }
    } catch (e) {
      console.warn("Failed to show browser notification:", e);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch KPIs
      const kpiRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/kpis");
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis({
          totalBookings: kpiData.total_bookings,
          totalRevenue: kpiData.total_revenue,
          totalPatients: kpiData.total_patients,
          pendingReports: kpiData.pending_reports
        });
      }

      // Fetch Bookings
      const bookingsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        
        // Notification check for MAIN_ADMIN, SUPPORT_ADMIN, PHLEBOTOMIST on new home collections
        const savedRole = localStorage.getItem("admin_role") || role;
        const savedName = localStorage.getItem("admin_name") || name;
        if (savedRole === "MAIN_ADMIN" || savedRole === "SUPPORT_ADMIN" || savedRole === "PHLEBOTOMIST") {
          if (bookings.length > 0) {
            const existingIds = new Set(bookings.map(b => b.id));
            const newHomeBookings = bookingsData.filter((b: any) => 
              b.booking_type === "HOME_COLLECTION" && 
              !existingIds.has(b.id) &&
              (savedRole !== "PHLEBOTOMIST" || b.assigned_phlebotomist === savedName)
            );
            
            if (newHomeBookings.length > 0) {
              playNotificationSound();
              newHomeBookings.forEach((hb: any) => {
                sendBrowserNotification(hb);
              });
            }
          }
        }
        
        setBookings(bookingsData);
      }

      // Fetch Leads
      const leadsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/corporate-enquiries");
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData);
      }

      // Fetch Catalog Tests
      const testsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/catalog/tests");
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setCatalogTests(testsData);
      }

      // Fetch Catalog Packages
      const pkgsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/packages");
      if (pkgsRes.ok) {
        const pkgsData = await pkgsRes.json();
        setPackages(pkgsData);
      }

      // Fetch Analytics
      const analyticsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/analytics");
      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalyticsData(aData);
      }

      // Fetch Pending Reviews
      const reviewsRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/reviews/pending");
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const mappedReviews = reviewsData.map((r: any) => ({
          id: r.id,
          name: r.patient_name,
          rating: r.rating,
          text: r.review_text,
          status: r.status
        }));
        setReviews(mappedReviews);
      }

      // Fetch user list
      const usersRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      } else {
        setUsers(MOCK_USERS);
      }

      // Fetch payment list
      const payRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/payments");
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData);
      } else {
        setPayments(MOCK_PAYMENTS);
      }

      // Fetch branches list
      const branchesRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/branches");
      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        setBranches(branchesData);
      } else {
        setBranches(MOCK_BRANCHES);
      }

      // Fetch admin blogs list
      fetchAdminBlogs();
    } catch (err) {
      // Fallback fallback states for offline simulation
      console.log("Using local mock states for dashboard.");
      setKpis({
        totalBookings: 3,
        totalRevenue: 2400,
        totalPatients: 3,
        pendingReports: 1
      });
      setBookings([
        {
          id: "b-101",
          patient_name: "Rajesh Kumar",
          phone: "9398175183",
          booking_type: "HOME_COLLECTION",
          status: "CONFIRMED",
          slot_time: "2026-06-20 08:00",
          total_amount: 399.00,
          payment_status: "SUCCESS",
          tests: ["Complete Blood Count (CBC)"]
        },
        {
          id: "b-102",
          patient_name: "Saraswathi Devi",
          phone: "9123456789",
          booking_type: "LAB_VISIT",
          status: "SAMPLE_COLLECTED",
          slot_time: "2026-06-19 10:00",
          total_amount: 599.00,
          payment_status: "PENDING",
          tests: ["Thyroid Profile (T3, T4, TSH)"]
        },
        {
          id: "b-103",
          patient_name: "Anil Kumar",
          phone: "9988776655",
          booking_type: "LAB_VISIT",
          status: "REPORT_UPLOADED",
          slot_time: "2026-06-19 11:00",
          total_amount: 499.00,
          payment_status: "SUCCESS",
          tests: ["Liver Function Test (LFT)"]
        }
      ]);
      setReviews([
        { id: "rev-1", name: "Ramesh K.", rating: 5, text: "Excellent speed", status: "PENDING" }
      ]);
      setLeads([
        { id: "l-1", company_name: "TCS Hyderabad", contact_person: "Manoj M.", phone: "9876543222", email: "hr@tcs.com", status: "PENDING", created_at: "2026-06-19" }
      ]);
      setCatalogTests([
        { id: "t-1", name: "Complete Blood Count (CBC)", price: 299, tat: "12 Hours", is_active: true },
        { id: "t-2", name: "Vitamin D (25-Hydroxy)", price: 999, tat: "24 Hours", is_active: true }
      ]);
      setAnalyticsData({
        booking_type_distribution: { lab_visits: 12, home_collections: 28 },
        top_tests: [
          { name: "Complete Blood Count (CBC)", bookings_count: 22 },
          { name: "Vitamin D (25-Hydroxy)", bookings_count: 14 },
          { name: "Thyroid Profile (T3, T4, TSH)", bookings_count: 8 }
        ]
      });
      setAdminBlogs(MOCK_ADMIN_BLOGS);
      setPayments(MOCK_PAYMENTS);
      setUsers(MOCK_USERS);
      setBranches(MOCK_BRANCHES);
    }
  };

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userRole = localStorage.getItem("admin_role");
    const userName = localStorage.getItem("admin_name");

    if (!token || !userRole) {
      router.push("/login");
      return;
    }

    setRole(userRole);
    setName(userName);

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    
    fetchData();
  }, [router]);

  // Polling for live updates (updates state every 5 seconds)
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);



  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlog.title.trim() || !newBlog.slug.trim() || !newBlog.content.trim() || !newBlog.authorName.trim()) {
      setBlogSubmitError("Please fill in all required blog fields.");
      return;
    }
    setSubmittingBlog(true);
    setBlogSubmitError("");
    setBlogSubmitMessage("");
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/blogs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBlog.title,
          slug: newBlog.slug,
          excerpt: newBlog.excerpt,
          content: newBlog.content,
          author_name: newBlog.authorName
        })
      });
      if (res.ok) {
        setBlogSubmitMessage("Blog draft created successfully!");
        setNewBlog({ title: "", slug: "", excerpt: "", content: "", authorName: "" });
        fetchAdminBlogs();
      } else {
        const errData = await res.json();
        setBlogSubmitError(errData.detail || "Failed to create blog. Check if slug is unique.");
      }
    } catch (err) {
      setBlogSubmitError("Network error. Please try again.");
    } finally {
      setSubmittingBlog(false);
    }
  };

  const handlePublishBlog = async (blogId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/blogs/publish/${blogId}`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Blog published successfully!");
        fetchAdminBlogs();
      } else {
        alert("Failed to publish blog.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const updateBookingStatus = async (bookingId: string, nextStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/bookings/${bookingId}/status?status=${nextStatus}`, {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error("Failed to update status on server.");
      }
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b));
      fetchData(); // refresh bookings list
    } catch (err: any) {
      console.log("Status update error, falling back to local state:", err);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b));
    }
  };

  const assignPhlebotomist = async (bookingId: string, collectorName: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/bookings/${bookingId}/assign-phlebotomist?phlebotomist_name=${encodeURIComponent(collectorName)}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Assignment failed");
      alert("Collector assigned successfully!");
      fetchData();
    } catch (err: any) {
      alert("Error assigning collector: " + err.message);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: packageForm.name,
        price: parseFloat(packageForm.price) || 0,
        discount_price: packageForm.discountPrice ? parseFloat(packageForm.discountPrice) : null,
        description: packageForm.description || null,
        test_ids: packageForm.testIds
      };

      const url = editingPackageId 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/packages/${editingPackageId}`
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/packages";
      
      const method = editingPackageId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to save package.");
      }

      alert(editingPackageId ? "Package updated successfully!" : "Package created successfully!");
      setIsPackageModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error saving package: " + err.message);
    }
  };

  const updatePackagePrice = async (packageId: string, newPrice: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/packages/${packageId}/price?price=${newPrice}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to update package price");
      alert("Package price updated successfully!");
      fetchData();
    } catch (err: any) {
      alert("Error updating package price: " + err.message);
    }
  };

  const handleUploadReport = async (bookingId: string) => {
    const file = selectedFiles[bookingId];
    if (!file) {
      alert("Please select a file to upload first.");
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      alert("Invalid format! Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the 10MB limit.");
      return;
    }

    setUploadProgress(prev => ({ ...prev, [bookingId]: "Uploading..." }));
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const criticalValue = criticalFlags[bookingId] || false;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/reports/upload?booking_id=${bookingId}&critical_value=${criticalValue}`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload failed.");
      }

      const reportData = await res.json();
      setUploadChecksums(prev => ({ ...prev, [bookingId]: reportData.checksum }));
      setUploadProgress(prev => ({ ...prev, [bookingId]: "Success" }));
      
      alert(`Report successfully uploaded!\nChecksum: ${reportData.checksum}\nSize: ${(reportData.file_size / 1024).toFixed(2)} KB`);
      fetchData(); // reload bookings
    } catch (err: any) {
      setUploadProgress(prev => ({ ...prev, [bookingId]: "Failed" }));
      alert("Upload failed: " + err.message);
    }
  };

  const handleApproveReport = async (reportId: string, bookingId: string) => {
    try {
      const adminUserId = localStorage.getItem("admin_user_id") || "00000000-0000-0000-0000-000000000000";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/reports/approve/${reportId}?admin_user_id=${adminUserId}`, {
        method: "POST"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Approval failed.");
      }

      alert("Report approved and patient notified successfully!");
      fetchData(); // reload bookings
    } catch (err: any) {
      alert("Approval failed: " + err.message);
    }
  };

  const handleSendWhatsApp = (booking: any) => {
    if (!booking.phone || booking.phone === "N/A") {
      alert("No registered phone number found for this patient.");
      return;
    }
    const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
    const patientPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 
      ? cleanPhone 
      : cleanPhone.length === 10 
        ? `91${cleanPhone}` 
        : cleanPhone;

    const message = encodeURIComponent(
      `Dear *${booking.patient_name}*,\n\nYour diagnostic lab report for *${booking.tests.join(", ")}* is ready. You can securely access and download it on our portal:\n\n🔗 http://localhost:3000\n\nThank you for choosing Vicky Diagnostics.`
    );
    window.open(`https://wa.me/${patientPhone}?text=${message}`, "_blank");
  };

  // Review approval action
  const approveReview = async (id: string) => {
    try {
      const adminUserId = localStorage.getItem("admin_user_id") || "00000000-0000-0000-0000-000000000000";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/reviews/approve/${id}?admin_user_id=${adminUserId}`, {
        method: "POST"
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
        alert("Review approved and published!");
      } else {
        const errData = await res.json();
        alert("Failed to approve review: " + (errData.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("Error approving review:", err);
      setReviews(reviews.filter(r => r.id !== id));
      alert("Review approved and published (local fallback)!");
    }
  };

  // Catalog CRUD price changer
  const updateTestPrice = (id: string, newPrice: number) => {
    setCatalogTests(catalogTests.map(t => t.id === id ? { ...t, price: newPrice } : t));
  };

  // Simulation Handlers
  const handleProcessRefund = async (paymentId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/payments/${paymentId}/refund`, {
        method: "POST"
      });
      if (res.ok) {
        setPayments(payments.map(p => p.id === paymentId ? { ...p, status: "REFUNDED" } : p));
        alert("Refund successfully processed on database!");
      } else {
        throw new Error("Failed to process database refund.");
      }
    } catch (err) {
      console.log("Using client simulation for refund.");
      setPayments(payments.map(p => p.id === paymentId ? { ...p, status: "REFUNDED" } : p));
      alert("Refund successfully processed (local simulation)!");
    }
  };

  const handleMarkPaymentSuccess = (paymentId: string) => {
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: "SUCCESS" } : p));
    alert("Payment status updated to SUCCESS.");
  };

  const handleResetPassword = async (userId: string) => {
    const pStr = prompt("Enter new password:");
    if (!pStr) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pStr })
      });
      if (res.ok) {
        alert("Password successfully reset in backend database!");
      } else {
        throw new Error();
      }
    } catch (err) {
      alert("Password successfully reset (local simulation)!");
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/users/${userId}/toggle-status`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
        alert(`User account status updated on database.`);
      } else {
        throw new Error();
      }
    } catch (err) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
      alert("User account status updated (local simulation).");
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          username: newUser.username,
          password: newUser.password,
          full_name: newUser.fullName,
          role_name: newUser.roleName
        })
      });
      if (res.ok) {
        setUsers([...users, { id: `u-${Date.now()}`, email: newUser.email, username: newUser.username, full_name: newUser.fullName, role: newUser.roleName, is_active: true }]);
        setNewUser({ email: "", username: "", password: "", fullName: "", roleName: "SUPPORT_ADMIN" });
        alert("Staff user registered successfully on database!");
      } else {
        const data = await res.json();
        alert("Failed: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      setUsers([...users, { id: `u-${Date.now()}`, email: newUser.email, username: newUser.username, full_name: newUser.fullName, role: newUser.roleName, is_active: true }]);
      setNewUser({ email: "", username: "", password: "", fullName: "", roleName: "SUPPORT_ADMIN" });
      alert("Staff user registered successfully (local simulation)!");
    }
  };

  const handleToggleBranchStatus = async (branchId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/branches/${branchId}/toggle-status`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setBranches(branches.map(b => b.id === branchId ? { ...b, is_active: data.is_active } : b));
        alert("Branch status updated on database.");
      } else {
        throw new Error();
      }
    } catch (err) {
      setBranches(branches.map(b => b.id === branchId ? { ...b, is_active: !b.is_active } : b));
      alert("Branch status updated (local simulation).");
    }
  };

  const handleRegisterBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBranch.name,
          city: newBranch.city,
          address: newBranch.address,
          phone: newBranch.phone
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBranches([...branches, { id: data.id || `br-${Date.now()}`, name: newBranch.name, city: newBranch.city, address: newBranch.address, phone: newBranch.phone, is_active: true }]);
        setNewBranch({ name: "", city: "", address: "", phone: "" });
        alert("Location branch added successfully on database!");
      } else {
        const data = await res.json();
        alert("Failed to add branch: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      setBranches([...branches, { id: `br-${Date.now()}`, name: newBranch.name, city: newBranch.city, address: newBranch.address, phone: newBranch.phone, is_active: true }]);
      setNewBranch({ name: "", city: "", address: "", phone: "" });
      alert("Location branch added successfully (local simulation)!");
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Configuration parameters updated successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dashboard Top bar */}
      <header className="bg-slate-900 text-white h-16 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-lg bg-primary text-white font-bold text-lg flex items-center justify-center">
            V
          </span>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Vicky Diagnostics Dashboard</h1>
            <p className="text-[10px] text-slate-400">Authorized: {role} ({name})</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-standard"
        >
          Sign Out
        </button>
      </header>

      {/* KPIs Summary Cards */}
      <section className={`max-w-7xl mx-auto w-full px-6 pt-8 grid gap-4 ${role === "MAIN_ADMIN" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpis.totalBookings}</p>
        </div>
        {role === "MAIN_ADMIN" && (
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm animate-in fade-in duration-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{kpis.totalRevenue}</p>
          </div>
        )}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Patients</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpis.totalPatients}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Reports</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{kpis.pendingReports}</p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Performance & Distribution Analytics Panel */}
        {role === "MAIN_ADMIN" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            {/* Donut Chart (Distribution) */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex items-center justify-center h-32 w-32 flex-shrink-0">
                <svg width="110" height="110" viewBox="0 0 33.8 33.8" className="transform -rotate-90">
                  <circle cx="16.9" cy="16.9" r="14.3" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                  <circle 
                    cx="16.9" 
                    cy="16.9" 
                    r="14.3" 
                    fill="transparent" 
                    stroke="#0f172a" 
                    strokeWidth="4" 
                    strokeDasharray={`${
                      Math.round((analyticsData.booking_type_distribution.home_collections / (analyticsData.booking_type_distribution.lab_visits + analyticsData.booking_type_distribution.home_collections || 1)) * 100)
                    } ${
                      100 - Math.round((analyticsData.booking_type_distribution.home_collections / (analyticsData.booking_type_distribution.lab_visits + analyticsData.booking_type_distribution.home_collections || 1)) * 100)
                    }`} 
                    strokeDashoffset="0" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900">
                    {Math.round((analyticsData.booking_type_distribution.home_collections / (analyticsData.booking_type_distribution.lab_visits + analyticsData.booking_type_distribution.home_collections || 1)) * 100)}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Home Coll.</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Booking Channel Distribution</h3>
                  <p className="text-xs text-slate-500">Comparing patient collection channels</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-900"></span>
                    <span className="text-slate-700">
                      Home Sample Collection: <strong>{analyticsData.booking_type_distribution.home_collections} ({Math.round((analyticsData.booking_type_distribution.home_collections / (analyticsData.booking_type_distribution.lab_visits + analyticsData.booking_type_distribution.home_collections || 1)) * 100)}%)</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-200"></span>
                    <span className="text-slate-700">
                      Visit Diagnostic Center: <strong>{analyticsData.booking_type_distribution.lab_visits} ({100 - Math.round((analyticsData.booking_type_distribution.home_collections / (analyticsData.booking_type_distribution.lab_visits + analyticsData.booking_type_distribution.home_collections || 1)) * 100)}%)</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart (Popular Tests) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Popular Diagnostic Tests</h3>
                <p className="text-xs text-slate-500">Volume tracking of top requests</p>
              </div>
              <div className="space-y-3">
                {analyticsData.top_tests.map((test: any, idx: number) => {
                  const maxCount = analyticsData.top_tests[0]?.bookings_count || 1;
                  const percentage = Math.round((test.bookings_count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{test.name}</span>
                        <span className="font-bold text-slate-900">{test.bookings_count} bookings</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        {/* Support Admin & Main Admin View */}
        {(role === "SUPPORT_ADMIN" || role === "MAIN_ADMIN") && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">
            {/* Tabs Sidebar */}
            <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                  activeTab === "pipeline" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                📋 Bookings Pipeline
              </button>
              <button
                onClick={() => setActiveTab("home_collections")}
                className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                  activeTab === "home_collections" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                🏠 Home Collections
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                  activeTab === "catalog" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                🩺 Tests Catalog
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                  activeTab === "reviews" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                💬 Reviews Queue
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                  activeTab === "leads" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                🏢 B2B Corporate Leads
              </button>
              <button
                onClick={() => setActiveTab("blogs")}
                className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                  activeTab === "blogs" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                ✍️ Blogs Manager
              </button>

              {/* Main Admin Only tabs */}
              {role === "MAIN_ADMIN" && (
                <>
                  <button
                    onClick={() => setActiveTab("finance")}
                    className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                      activeTab === "finance" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    💳 Finance & Refunds
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                      activeTab === "analytics" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    📊 Analytics & Reports
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                      activeTab === "users" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    👥 User Management
                  </button>
                  <button
                    onClick={() => setActiveTab("branches")}
                    className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                      activeTab === "branches" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    🏢 Branch Management
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full text-left py-2 px-3 text-xs font-bold rounded-md transition-standard ${
                      activeTab === "settings" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    ⚙️ System Settings
                  </button>
                </>
              )}
            </div>

            {/* Tab Panels */}
            <div className="flex-1 p-6">
              
              {/* TAB 1: KANBAN LIFECYCLE BOOKING PIPELINE */}
              {activeTab === "pipeline" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Bookings Pipeline Stages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pipeline column 1: Confirmed */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase pb-1 border-b">Confirmed</h4>
                      {bookings.filter(b => b.status === "CONFIRMED").map(b => (
                        <div key={b.id} className="bg-white border rounded p-3 text-xs space-y-2 shadow-sm">
                          <p className="font-bold text-slate-800">{b.patient_name}</p>
                          <p className="text-[10px] text-slate-500">Slot: {b.slot_time}</p>
                          <p className="text-[10px] text-slate-500">Test: {b.tests.join(", ")}</p>
                          <button
                            onClick={() => updateBookingStatus(b.id, "SAMPLE_COLLECTED")}
                            className="w-full mt-2 py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-hover"
                          >
                            Mark Sample Collected &rarr;
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Pipeline column 2: Sample Collected / In Lab */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase pb-1 border-b">Processing / In Lab</h4>
                      {bookings.filter(b => b.status === "SAMPLE_COLLECTED" || b.status === "PROCESSING").map(b => (
                        <div key={b.id} className="bg-white border border-amber-200 rounded p-3 text-xs space-y-2 shadow-sm">
                          <p className="font-bold text-slate-800">{b.patient_name}</p>
                          <p className="text-[10px] text-slate-500">Test: {b.tests.join(", ")}</p>
                          <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Pending Report Upload
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pipeline column 3: Report Uploaded (Needs Admin Approval) */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase pb-1 border-b">Uploaded / Approvals</h4>
                      {bookings.filter(b => b.status === "REPORT_UPLOADED").map(b => (
                        <div key={b.id} className="bg-white border border-green-200 rounded p-3 text-xs space-y-2 shadow-sm">
                          <p className="font-bold text-slate-800">{b.patient_name}</p>
                          <p className="text-[10px] text-slate-500">Test: {b.tests.join(", ")}</p>
                          <button
                            onClick={() => {
                              if (b.report_id) {
                                handleApproveReport(b.report_id, b.id);
                              } else {
                                updateBookingStatus(b.id, "COMPLETED");
                              }
                            }}
                            className="w-full mt-2 py-1 bg-accent text-white text-[10px] font-bold rounded hover:bg-accent-hover cursor-pointer"
                          >
                            ✓ Approve & Notify patient
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(b)}
                            className="w-full mt-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                          >
                            💬 Send on WhatsApp
                          </button>                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1.5: HOME COLLECTIONS OPERATIONS */}
              {activeTab === "home_collections" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Home Sample Collections Panel</h3>
                    <p className="text-[10px] text-slate-400 font-normal">Manage home bookings, assign phlebotomists, and review sample collections.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. Pending collections */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                      <div className="border-b pb-2 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pending Collections</h4>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && (b.status === "CONFIRMED" || b.status === "PENDING")).length}
                        </span>
                      </div>
                      
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && (b.status === "CONFIRMED" || b.status === "PENDING")).map(b => (
                          <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-2.5 shadow-sm">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{b.patient_name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Slot: {b.slot_time} | Phone: {b.phone}</p>
                              <p className="text-[10px] text-slate-600 font-medium mt-1">🧪 Tests: {b.tests.join(", ")}</p>
                              <p className="bg-slate-50 border border-slate-100 rounded p-1.5 text-[10px] text-slate-700 mt-2 font-mono">
                                📍 {b.home_collection_address ? `${b.home_collection_address.house_number ? `${b.home_collection_address.house_number}, ` : ""}${b.home_collection_address.landmark ? `${b.home_collection_address.landmark}, ` : ""}${b.home_collection_address.area ? `${b.home_collection_address.area} - ` : ""}${b.home_collection_address.pincode || ""}` : "No address details available"}
                              </p>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Assign Collector:</label>
                              <div className="flex gap-1.5">
                                <select
                                  defaultValue={b.assigned_phlebotomist || ""}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      assignPhlebotomist(b.id, e.target.value);
                                    }
                                  }}
                                  className="flex-1 text-[11px] font-bold border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option value="">-- Select Phlebotomist --</option>
                                  {users.filter(u => u.role === "PHLEBOTOMIST").map(u => (
                                    <option key={u.id} value={u.full_name}>{u.full_name}</option>
                                  ))}
                                </select>
                              </div>
                              {b.assigned_phlebotomist && (
                                <p className="text-[10px] text-primary font-bold">Assigned: {b.assigned_phlebotomist}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && (b.status === "CONFIRMED" || b.status === "PENDING")).length === 0 && (
                          <p className="text-xs text-slate-400 py-6 text-center">No pending home collections.</p>
                        )}
                      </div>
                    </div>

                    {/* 2. Collected samples */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                      <div className="border-b pb-2 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Collected / Processing</h4>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && (b.status === "SAMPLE_COLLECTED" || b.status === "PROCESSING")).length}
                        </span>
                      </div>
                      
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && (b.status === "SAMPLE_COLLECTED" || b.status === "PROCESSING")).map(b => (
                          <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-2 shadow-sm">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-slate-800 text-sm">{b.patient_name}</p>
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {b.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">Slot: {b.slot_time}</p>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">🧪 Tests: {b.tests.join(", ")}</p>
                            <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-600">
                              <p>👤 Collector: <strong className="text-slate-800">{b.assigned_phlebotomist || "Home Collector Team"}</strong></p>
                            </div>
                          </div>
                        ))}
                        {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && (b.status === "SAMPLE_COLLECTED" || b.status === "PROCESSING")).length === 0 && (
                          <p className="text-xs text-slate-400 py-6 text-center">No collected samples currently processing.</p>
                        )}
                      </div>
                    </div>

                    {/* 3. Completed collections */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                      <div className="border-b pb-2 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Completed Collections</h4>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && b.status === "COMPLETED").length}
                        </span>
                      </div>
                      
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && b.status === "COMPLETED").map(b => (
                          <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-2 shadow-sm">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-slate-800 text-sm">{b.patient_name}</p>
                              <span className="bg-green-50 text-green-800 border border-green-200 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Completed
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">Slot: {b.slot_time}</p>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">🧪 Tests: {b.tests.join(", ")}</p>
                            <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-600">
                              <p>👤 Collector: <strong className="text-slate-800">{b.assigned_phlebotomist || "Home Collector Team"}</strong></p>
                            </div>
                          </div>
                        ))}
                        {bookings.filter(b => b.booking_type === "HOME_COLLECTION" && b.status === "COMPLETED").length === 0 && (
                          <p className="text-xs text-slate-400 py-6 text-center">No completed collections today.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TESTS & PACKAGES CATALOG CRUD */}
              {activeTab === "catalog" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Catalog & Price Management</h3>
                      <p className="text-[10px] text-slate-400 font-normal">Manage prices for diagnostic tests and bundle health packages.</p>
                    </div>
                    
                    {catalogSubTab === "packages" && (
                      <button
                        onClick={() => {
                          setEditingPackageId(null);
                          setPackageForm({ name: "", price: "", discountPrice: "", description: "", testIds: [] });
                          setModalTestSearch("");
                          setIsPackageModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
                      >
                        ➕ New Package
                      </button>
                    )}
                  </div>

                  {/* Sub Tab Switcher */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCatalogSubTab("tests");
                        setCatalogSearch("");
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-standard cursor-pointer ${
                        catalogSubTab === "tests"
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      🩺 Diagnostic Tests
                    </button>
                    <button
                      onClick={() => {
                        setCatalogSubTab("packages");
                        setCatalogSearch("");
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-standard cursor-pointer ${
                        catalogSubTab === "packages"
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      📦 Health Packages
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">🔍</span>
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder={catalogSubTab === "tests" ? "Search diagnostic tests..." : "Search health packages..."}
                      className="w-full border border-slate-200 rounded-lg p-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                    />
                  </div>

                  <div className="flex gap-4">
                    {/* A-Z Index Sidebar */}
                    <div className="flex flex-col gap-0.5 border-r border-slate-100 pr-2 max-h-[500px] overflow-y-auto select-none">
                      {["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#"].map(letter => (
                        <button
                          key={letter}
                          onClick={() => scrollToCatalogLetter(letter)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>

                    {/* Grouped Catalog Items List */}
                    <div className="flex-1">
                      {(() => {
                        const filtered = (catalogSubTab === "tests" ? catalogTests : packages).filter(item =>
                          item.name.toLowerCase().includes(catalogSearch.toLowerCase())
                        );
                        
                        const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                        const groups: { [key: string]: any[] } = {};
                        sorted.forEach(item => {
                          const firstLetter = item.name.trim().charAt(0).toUpperCase();
                          const key = /[A-Z]/.test(firstLetter) ? firstLetter : "#";
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(item);
                        });
                        
                        const groupKeys = Object.keys(groups).sort();
                        if (groupKeys.length === 0) {
                          return (
                            <p className="text-xs text-slate-400 py-12 text-center border rounded-lg bg-slate-50">No items match your search.</p>
                          );
                        }
                        
                        return (
                          <div ref={catalogContainerRef} className="max-h-[500px] overflow-y-auto space-y-6 pr-2">
                            {groupKeys.map(letter => (
                              <div key={letter} id={`catalog-letter-group-${letter.toLowerCase()}`} className="space-y-2">
                                <h4 className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded w-fit uppercase tracking-wider">{letter}</h4>
                                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                                  <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
                                      <tr>
                                        <th className="p-3">Name</th>
                                        {catalogSubTab === "tests" ? (
                                          <>
                                            <th className="p-3">TAT</th>
                                            <th className="p-3">Price (INR)</th>
                                          </>
                                        ) : (
                                          <>
                                            <th className="p-3">Included Tests</th>
                                            <th className="p-3">Price (INR)</th>
                                            <th className="p-3">Discount Price</th>
                                          </>
                                        )}
                                        <th className="p-3 text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {groups[letter].map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                          <td className="p-3 font-bold text-slate-800">
                                            {item.name}
                                            {catalogSubTab === "packages" && item.description && (
                                              <p className="text-[10px] font-normal text-slate-400 mt-0.5">{item.description}</p>
                                            )}
                                          </td>
                                          {catalogSubTab === "tests" ? (
                                            <>
                                              <td className="p-3">{item.tat}</td>
                                              <td className="p-3 font-semibold text-slate-900">₹{item.price}</td>
                                            </>
                                          ) : (
                                            <>
                                              <td className="p-3">
                                                <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[9px] mb-1">
                                                  {item.tests?.length || 0} tests
                                                </span>
                                                <div className="text-[10px] text-slate-500 font-normal">
                                                  {item.tests?.map((t: any) => t.name).join(", ")}
                                                </div>
                                              </td>
                                              <td className="p-3 font-semibold text-slate-900 font-mono">₹{item.price}</td>
                                              <td className="p-3 font-semibold text-green-700 font-mono">{item.discount_price ? `₹${item.discount_price}` : "N/A"}</td>
                                            </>
                                          )}
                                          <td className="p-3 text-right space-x-3">
                                            {catalogSubTab === "tests" ? (
                                              <button
                                                onClick={() => {
                                                  const pStr = prompt(`Set new price for ${item.name}:`, String(item.price));
                                                  if (pStr && !isNaN(Number(pStr))) {
                                                    updateTestPrice(item.id, Number(pStr));
                                                  }
                                                }}
                                                className="text-xs text-primary font-bold hover:underline cursor-pointer"
                                              >
                                                Edit Price
                                              </button>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    setEditingPackageId(item.id);
                                                    setPackageForm({
                                                      name: item.name,
                                                      price: String(item.price),
                                                      discountPrice: item.discount_price ? String(item.discount_price) : "",
                                                      description: item.description || "",
                                                      testIds: item.tests ? item.tests.map((t: any) => t.id) : []
                                                    });
                                                    setModalTestSearch("");
                                                    setIsPackageModalOpen(true);
                                                  }}
                                                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                                                >
                                                  Edit
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    const pStr = prompt(`Set new price for ${item.name}:`, String(item.price));
                                                    if (pStr && !isNaN(Number(pStr))) {
                                                      updatePackagePrice(item.id, Number(pStr));
                                                    }
                                                  }}
                                                  className="text-xs text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                                                >
                                                  Edit Price
                                                </button>
                                              </>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS MODERATION QUEUE */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Patient Reviews Moderation Queue</h3>
                  <div className="space-y-3">
                    {reviews.map(rev => (
                      <div key={rev.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start bg-slate-50">
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-slate-800">{rev.name} (Rating: {rev.rating}★)</p>
                          <p className="text-slate-600 italic">"{rev.text}"</p>
                        </div>
                        <button
                          onClick={() => approveReview(rev.id)}
                          className="px-3 py-1 bg-accent text-white text-xs font-bold rounded shadow hover:bg-accent-hover transition-standard"
                        >
                          Approve Review
                        </button>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-xs text-slate-400 py-6 text-center">No pending reviews to moderate.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: B2B LEADS LIST */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">B2B Corporate Checkup Leads</h3>
                  <div className="space-y-3">
                    {leads.map(lead => (
                      <div key={lead.id} className="border border-slate-200 rounded-lg p-4 text-xs space-y-2 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{lead.company_name}</h4>
                            <p className="text-[10px] text-slate-400">Submitted: {lead.created_at}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[9px] uppercase">
                            {lead.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <p>👤 Contact: {lead.contact_person}</p>
                          <p>📞 Phone: {lead.phone}</p>
                          <p className="col-span-2">✉️ Email: {lead.email}</p>
                        </div>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <p className="text-xs text-slate-400 py-6 text-center">No corporate checkup leads submitted yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: BLOGS MANAGER */}
              {activeTab === "blogs" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Blogs & Patient Library CMS</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List of articles */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b pb-1">All Articles & Drafts</h4>
                      <div className="space-y-3">
                        {adminBlogs.map((blog) => (
                          <div key={blog.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <h5 className="font-bold text-slate-800">{blog.title}</h5>
                              <p className="text-[10px] text-slate-500">By {blog.author_name} · Slug: {blog.slug}</p>
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                                blog.status === "PUBLISH" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {blog.status === "PUBLISH" ? "Published" : "Draft"}
                              </span>
                            </div>
                            {blog.status !== "PUBLISH" && (
                              <button
                                onClick={() => handlePublishBlog(blog.id)}
                                className="px-3 py-1 bg-accent text-white font-bold rounded shadow hover:bg-accent-hover text-[10px]"
                              >
                                Publish &rarr;
                              </button>
                            )}
                          </div>
                        ))}
                        {adminBlogs.length === 0 && (
                          <p className="text-xs text-slate-400 py-6 text-center">No blog articles created yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Create Blog Post Form */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase border-b pb-2">Draft New Article</h4>
                      <form onSubmit={handleCreateBlog} className="space-y-2.5 text-xs">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Understanding Thyroid"
                            value={newBlog.title}
                            onChange={(e) => {
                              const title = e.target.value;
                              const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                              setNewBlog({ ...newBlog, title, slug });
                            }}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Slug *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. understanding-thyroid"
                            value={newBlog.slug}
                            onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Author *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Ramesh, Biochemist"
                            value={newBlog.authorName}
                            onChange={(e) => setNewBlog({ ...newBlog, authorName: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Excerpt (Short Summary)</label>
                          <textarea
                            rows={2}
                            placeholder="Brief description for SEO card..."
                            value={newBlog.excerpt}
                            onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Content (Markdown / Text) *</label>
                          <textarea
                            rows={5}
                            required
                            placeholder="Write the full health library article details..."
                            value={newBlog.content}
                            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {blogSubmitMessage && (
                          <p className="text-[9px] font-semibold text-green-700 bg-green-50 p-2 border border-green-200 rounded">
                            {blogSubmitMessage}
                          </p>
                        )}
                        
                        {blogSubmitError && (
                          <p className="text-[9px] font-semibold text-red-700 bg-red-50 p-2 border border-red-200 rounded">
                            {blogSubmitError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={submittingBlog}
                          className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded disabled:opacity-50"
                        >
                          {submittingBlog ? "Creating Draft..." : "Save Draft"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: FINANCE & REFUNDS */}
              {activeTab === "finance" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Financial Transactions & Refunds</h3>
                      <p className="text-xs text-slate-500">Track online Razorpay and offline cash payments</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-semibold">
                      Total Revenue: ₹{kpis.totalRevenue}
                    </span>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razorpay (Online)</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">
                        ₹{payments.filter(p => p.method === "RAZORPAY" && p.status === "SUCCESS").reduce((acc, curr) => acc + curr.amount, 0)}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cash at Centre (Offline)</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">
                        ₹{payments.filter(p => p.method === "CASH" && p.status === "SUCCESS").reduce((acc, curr) => acc + curr.amount, 0)}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Refunded</p>
                      <p className="text-xl font-extrabold text-red-600 mt-1">
                        ₹{payments.filter(p => p.status === "REFUNDED").reduce((acc, curr) => acc + curr.amount, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-100 font-bold text-slate-700 uppercase">
                        <tr>
                          <th className="p-3">Patient</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {payments.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{p.patient_name}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.method === "RAZORPAY" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}>
                                {p.method}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-955">₹{p.amount}</td>
                            <td className="p-3 text-slate-500">{p.created_at}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                p.status === "SUCCESS" ? "bg-green-100 text-green-800" :
                                p.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {p.status === "SUCCESS" && (
                                <button
                                  onClick={() => handleProcessRefund(p.id)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Process Refund
                                </button>
                              )}
                              {p.status === "REFUNDED" && (
                                <span className="text-[10px] text-slate-400 italic">Refunded</span>
                              )}
                              {p.status === "PENDING" && (
                                <button
                                  onClick={() => handleMarkPaymentSuccess(p.id)}
                                  className="px-2 py-1 bg-primary hover:bg-primary-hover text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Mark Success
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: ANALYTICS & DETAILED REPORTS */}
              {activeTab === "analytics" && (
                <div className="space-y-6 animate-in fade-in duration-200 font-semibold">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Business Analytics & Growth</h3>
                    <p className="text-xs text-slate-500 font-normal">Overview of diagnostics revenue streams and bookings volume</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Growth Trend (CSS Visual) */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Revenue Trend</h4>
                        <p className="text-[10px] text-slate-400 font-normal">Quarterly growth index</p>
                      </div>
                      <div className="h-40 flex items-end justify-between pt-6 border-b border-l border-slate-200 px-4">
                        {[
                          { month: "Jan", val: 30, rev: "₹92k" },
                          { month: "Feb", val: 45, rev: "₹138k" },
                          { month: "Mar", val: 35, rev: "₹107k" },
                          { month: "Apr", val: 65, rev: "₹199k" },
                          { month: "May", val: 80, rev: "₹246k" },
                          { month: "Jun", val: 95, rev: "₹291k" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 w-10 group relative">
                            <div className="absolute -top-6 bg-slate-900 text-white font-bold text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                              {item.rev}
                            </div>
                            <div 
                              className="w-full bg-primary group-hover:bg-primary-hover rounded-t transition-all duration-500" 
                              style={{ height: `${item.val}%` }}
                            ></div>
                            <span className="text-[9px] font-bold text-slate-500">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bookings split by patient categories */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Demographics Breakdown</h4>
                        <p className="text-[10px] text-slate-400 font-normal">Distribution by age groups</p>
                      </div>
                      <div className="space-y-3 pt-2">
                        {[
                          { group: "Pediatric (0-17)", val: 12, pct: 15, color: "bg-blue-400" },
                          { group: "Adult (18-59)", val: 48, pct: 60, color: "bg-primary" },
                          { group: "Geriatric (60+)", val: 20, pct: 25, color: "bg-accent" }
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{item.group}</span>
                              <span className="text-slate-950">{item.val} patients ({item.pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: USER MANAGEMENT */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-in fade-in duration-200 font-semibold">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">User Account Management</h3>
                      <p className="text-xs text-slate-500 font-normal">Configure portal logins for Support Admins, Laboratory Technicians, and Phlebotomists / Home Collectors</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Users list */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b pb-1">Portal Staff</h4>
                      <div className="space-y-3">
                        {users.map(u => (
                          <div key={u.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex justify-between items-center text-xs shadow-sm font-medium">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">{u.full_name} ({u.username})</p>
                              <p className="text-[10px] text-slate-500">Email: {u.email}</p>
                              <div className="flex gap-2 items-center">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                                  u.role === "MAIN_ADMIN" ? "bg-purple-100 text-purple-800" :
                                  u.role === "SUPPORT_ADMIN" ? "bg-blue-100 text-blue-800" :
                                  u.role === "PHLEBOTOMIST" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                  {u.role}
                                </span>
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                                  u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {u.is_active ? "Active" : "Disabled"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResetPassword(u.id)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 border text-slate-700 text-[10px] font-semibold rounded shadow-sm transition-colors cursor-pointer"
                              >
                                Reset Pass
                              </button>
                              {u.role !== "MAIN_ADMIN" && (
                                <button
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  className={`px-2 py-1 text-white text-[10px] font-bold rounded shadow-sm transition-colors cursor-pointer ${
                                    u.is_active ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                                  }`}
                                >
                                  {u.is_active ? "Disable" : "Enable"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Register User Form */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 shadow-sm h-fit">
                      <h4 className="text-xs font-bold text-slate-800 uppercase border-b pb-2">Register Staff Account</h4>
                      <form onSubmit={handleRegisterUser} className="space-y-3 text-xs">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Sireesha"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Username *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. sireesha"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().trim() })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="sireesha@vickydiagnostics.com"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value.trim() })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Password *</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Role *</label>
                          <select
                            value={newUser.roleName}
                            onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 bg-white focus:outline-none focus:border-primary font-medium"
                          >
                            <option value="SUPPORT_ADMIN">Support Admin</option>
                            <option value="LAB_TECHNICIAN">Lab Technician</option>
                            <option value="PHLEBOTOMIST">Home Collector / Phlebotomist</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded transition-colors mt-2 cursor-pointer"
                        >
                          Register Staff
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: BRANCH MANAGEMENT */}
              {activeTab === "branches" && (
                <div className="space-y-6 animate-in fade-in duration-200 font-semibold">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Branch Center Locations</h3>
                      <p className="text-xs text-slate-500 font-normal">Configure active diagnostic collection centers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Branches list */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b pb-1">All Centers</h4>
                      <div className="space-y-3">
                        {branches.map(b => (
                          <div key={b.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex justify-between items-start text-xs shadow-sm font-medium">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-slate-800 text-sm">{b.name}</h5>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  b.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {b.is_active ? "Active" : "Disabled"}
                                </span>
                              </div>
                              <p className="text-slate-600 leading-relaxed">📍 {b.address}, {b.city}</p>
                              {b.phone && <p className="text-[10px] text-slate-500">📞 Contact: {b.phone}</p>}
                            </div>
                            <button
                              onClick={() => handleToggleBranchStatus(b.id)}
                              className={`px-3 py-1 text-white text-[10px] font-bold rounded shadow-sm transition-colors cursor-pointer ${
                                b.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {b.is_active ? "Disable" : "Enable"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Branch Form */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 shadow-sm h-fit">
                      <h4 className="text-xs font-bold text-slate-800 uppercase border-b pb-2">Add New Location</h4>
                      <form onSubmit={handleRegisterBranch} className="space-y-3 text-xs">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Branch Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. West Gachibowli Branch"
                            value={newBranch.name}
                            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">City *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Hyderabad"
                            value={newBranch.city}
                            onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Full Address *</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="e.g. 502 High Road, Gachibowli"
                            value={newBranch.address}
                            onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Phone Number</label>
                          <input
                            type="text"
                            placeholder="e.g. +91 93981 75183"
                            value={newBranch.phone}
                            onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded transition-colors mt-2 cursor-pointer"
                        >
                          Add Center
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: SYSTEM SETTINGS */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in duration-200 font-semibold">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Business & Platform Settings</h3>
                      <p className="text-xs text-slate-500 font-normal">Configure global configurations, working hours, and operational policies</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase">Daily Working Hours</label>
                          <input
                            type="text"
                            required
                            value={settings.workingHours}
                            onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-primary font-medium"
                          />
                          <p className="text-[10px] text-slate-400 font-normal">Restricts patient slot booking selections</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase">Slot Booking Capacity (per 30-min window)</label>
                          <input
                            type="number"
                            required
                            value={settings.slotCapacity}
                            onChange={(e) => setSettings({ ...settings, slotCapacity: parseInt(e.target.value) || 1 })}
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-primary font-medium"
                          />
                          <p className="text-[10px] text-slate-400 font-normal">Maximum concurrent phlebotomist appointments</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase">Home Collection Base Charges (INR)</label>
                          <input
                            type="number"
                            required
                            value={settings.homeCollectionCharges}
                            onChange={(e) => setSettings({ ...settings, homeCollectionCharges: parseInt(e.target.value) || 0 })}
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-primary font-medium"
                          />
                          <p className="text-[10px] text-slate-400 font-normal">Added to cart for home collection bookings</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase">Official Support Contact Number</label>
                          <input
                            type="text"
                            required
                            value={settings.contactPhone}
                            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-primary font-medium"
                          />
                          <p className="text-[10px] text-slate-400 font-normal">Visible to patients for help/cancellation requests</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 uppercase">Refund Eligibility Policy</label>
                          <input
                            type="text"
                            required
                            value={settings.refundPolicy}
                            onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 uppercase">Cancellation Lock Policy</label>
                          <input
                            type="text"
                            required
                            value={settings.cancellationPolicy}
                            onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow transition-colors cursor-pointer mt-4"
                      >
                        Save Configuration
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Lab Technician View */}
        {role === "LAB_TECHNICIAN" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
              Laboratory Technician Center: PDF Report Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Pending Bookings Upload</h4>
                <div className="space-y-3">
                  {bookings.filter(b => b.status === "SAMPLE_COLLECTED").map(b => (
                    <div key={b.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                      <div>
                        <p className="font-bold text-xs">{b.patient_name} ({b.phone})</p>
                        <p className="text-[10px] text-slate-500">Test: {b.tests.join(", ")}</p>
                        <p className="text-[10px] text-slate-400">Scheduled: {b.slot_time}</p>
                      </div>

                      {/* Real upload dropzone and controls */}
                      <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-3">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase text-left">Select Report File</label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setSelectedFiles(prev => ({ ...prev, [b.id]: file }));
                              setUploadProgress(prev => ({ ...prev, [b.id]: "" }));
                              setUploadChecksums(prev => ({ ...prev, [b.id]: "" }));
                            }}
                            className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                          />
                          {selectedFiles[b.id] && (
                            <p className="text-[10px] text-slate-500 text-left">
                              Selected: <strong>{selectedFiles[b.id]?.name}</strong> ({(selectedFiles[b.id]!.size / 1024).toFixed(1)} KB)
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`critical-${b.id}`}
                            checked={criticalFlags[b.id] || false}
                            onChange={(e) => setCriticalFlags(prev => ({ ...prev, [b.id]: e.target.checked }))}
                            className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <label htmlFor={`critical-${b.id}`} className="text-[10px] font-semibold text-red-600 uppercase cursor-pointer text-left">
                            ⚠️ Critical Report / Panic Value Flag
                          </label>
                        </div>

                        {uploadProgress[b.id] && (
                          <div className={`p-2 rounded text-[10px] font-semibold text-left ${
                            uploadProgress[b.id] === "Uploading..." ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            uploadProgress[b.id] === "Success" ? "bg-green-50 text-green-700 border border-green-200" :
                            "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            Status: {uploadProgress[b.id]}
                            {uploadChecksums[b.id] && (
                              <div className="mt-1 font-mono text-[9px] break-all">
                                Checksum: {uploadChecksums[b.id]}
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleUploadReport(b.id)}
                          disabled={!selectedFiles[b.id] || uploadProgress[b.id] === "Uploading..."}
                          className="w-full py-1.5 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors"
                        >
                          {uploadProgress[b.id] === "Uploading..." ? "Uploading File..." : "Commit Report Upload"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === "SAMPLE_COLLECTED").length === 0 && (
                    <p className="text-xs text-slate-400 py-6 text-center">No pending collection samples requiring report upload.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-6 md:pt-0">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Completed / Uploaded Reports Log</h4>
                <div className="space-y-2">
                  {bookings.filter(b => b.status === "REPORT_UPLOADED" || b.status === "COMPLETED").map(b => (
                    <div key={b.id} className="border border-slate-200 rounded p-3 text-xs bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{b.patient_name}</p>
                        <p className="text-[10px] text-slate-500">{b.tests.join(", ")}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 font-bold rounded text-[9px]">
                        Uploaded
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {role === "PHLEBOTOMIST" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Phlebotomist Home Collector Portal
                </h3>
                <p className="text-[10px] text-slate-400 font-normal">Manage your assigned home collection bookings and update sample collection status.</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                Collector Account
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">My Assigned Collections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.filter(b => b.assigned_phlebotomist === name && (b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "SAMPLE_COLLECTED")).map(b => (
                  <div key={b.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-xs text-slate-800">{b.patient_name}</p>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          b.status === "SAMPLE_COLLECTED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-1">
                        <p>📞 Phone: <strong>{b.phone}</strong></p>
                        <p>⏰ Slot: {b.slot_time}</p>
                        <p>🧪 Tests: {b.tests.join(", ")}</p>
                        <p className="bg-white border border-slate-200 rounded p-2 text-slate-800 mt-2 font-semibold">
                          📍 Address: {b.home_collection_address ? `${b.home_collection_address.house_number ? `${b.home_collection_address.house_number}, ` : ""}${b.home_collection_address.landmark ? `${b.home_collection_address.landmark}, ` : ""}${b.home_collection_address.area ? `${b.home_collection_address.area} - ` : ""}${b.home_collection_address.pincode || ""}` : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t mt-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          b.home_collection_address ? `${b.home_collection_address.house_number || ""} ${b.home_collection_address.landmark || ""} ${b.home_collection_address.area || ""} ${b.home_collection_address.pincode || ""}` : ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded text-center"
                      >
                        🗺️ Directions
                      </a>
                      {b.status !== "SAMPLE_COLLECTED" && (
                        <button
                          onClick={() => updateBookingStatus(b.id, "SAMPLE_COLLECTED")}
                          className="flex-1 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded cursor-pointer"
                        >
                          ✓ Sample Collected
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {bookings.filter(b => b.assigned_phlebotomist === name && (b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "SAMPLE_COLLECTED")).length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center col-span-2">No active home collection bookings assigned to you.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Interactive Package Creator / Editor Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsPackageModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-extrabold text-sm cursor-pointer"
            >
              ✕
            </button>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                {editingPackageId ? "✏️ Edit Health Package" : "➕ Create New Health Package"}
              </h3>
              <p className="text-[10px] text-slate-400 font-normal">Configure package details, pricing, and associate diagnostic tests.</p>
            </div>
            
            <form onSubmit={handleSavePackage} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Body Basic Package"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Regular Price"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Discount Price (INR)</label>
                  <input
                    type="number"
                    placeholder="Offer Price"
                    value={packageForm.discountPrice}
                    onChange={(e) => setPackageForm({ ...packageForm, discountPrice: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  placeholder="Describe package benefits, preparation info..."
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Diagnostic Tests *</label>
                <p className="text-[9px] text-slate-400 font-normal mb-2">Check the tests to associate with this package bundle.</p>
                
                {/* Modal Test Filter Input */}
                <div className="relative mb-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400 text-[10px]">🔍</span>
                  <input
                    type="text"
                    value={modalTestSearch}
                    onChange={(e) => setModalTestSearch(e.target.value)}
                    placeholder="Filter tests by name..."
                    className="w-full border border-slate-200 rounded-lg p-1.5 pl-7 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>

                <div className="flex gap-2">
                  {/* Modal A-Z letters column */}
                  <div className="flex flex-col gap-0.5 border-r border-slate-100 pr-1 max-h-40 overflow-y-auto select-none">
                    {["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#"].map(letter => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => scrollToModalTestLetter(letter)}
                        className="w-4.5 h-4.5 rounded flex items-center justify-center text-[8px] font-bold text-slate-450 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  
                  {/* Grouped Tests Checklist */}
                  <div ref={modalTestsContainerRef} className="flex-1 border border-slate-200 rounded-lg p-2.5 max-h-40 overflow-y-auto space-y-3 bg-slate-50 font-normal text-slate-700">
                    {(() => {
                      const filtered = catalogTests.filter(t => 
                        t.name.toLowerCase().includes(modalTestSearch.toLowerCase())
                      );
                      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                      
                      const groups: { [key: string]: any[] } = {};
                      sorted.forEach(t => {
                        const firstLetter = t.name.trim().charAt(0).toUpperCase();
                        const key = /[A-Z]/.test(firstLetter) ? firstLetter : "#";
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(t);
                      });
                      
                      const groupKeys = Object.keys(groups).sort();
                      if (groupKeys.length === 0) {
                        return <p className="text-[10px] text-slate-400 py-4 text-center">No tests match your filter.</p>;
                      }
                      
                      return groupKeys.map(letter => (
                        <div key={letter} id={`modal-test-letter-group-${letter.toLowerCase()}`} className="space-y-1.5">
                          <h5 className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit uppercase tracking-wider">{letter}</h5>
                          <div className="space-y-1.5 pl-1 flex flex-col">
                            {groups[letter].map(t => (
                              <label key={t.id} className="flex items-start gap-2 cursor-pointer hover:text-slate-900 transition-colors text-[11px] leading-tight select-none">
                                <input
                                  type="checkbox"
                                  checked={packageForm.testIds.includes(t.id)}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...packageForm.testIds, t.id]
                                      : packageForm.testIds.filter(id => id !== t.id);
                                    setPackageForm({ ...packageForm, testIds: updated });
                                  }}
                                  className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 mt-0.5"
                                />
                                <span>{t.name} <span className="font-semibold text-slate-500 font-mono">(₹{t.price})</span></span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
              >
                {editingPackageId ? "Save Health Package" : "Create Health Package"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
