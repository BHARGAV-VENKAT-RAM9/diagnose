"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Authenticate with the backend API
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "") + "/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_role", data.role);
      localStorage.setItem("admin_name", data.full_name);
      localStorage.setItem("admin_user_id", data.user_id);

      router.push("/dashboard");
    } catch (err: any) {
      // Fallback for offline demo mode
      if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true") {
        if (username === "admin" && password === "admin") {
          localStorage.setItem("admin_token", "mock_admin_token_sspi_checksum");
          localStorage.setItem("admin_role", "SUPPORT_ADMIN");
          localStorage.setItem("admin_name", "Support Admin Demo");
          localStorage.setItem("admin_user_id", "b586c58f-b41b-4bb9-9de5-6da6128cdc9e");
          router.push("/dashboard");
        } else if (username === "owner" && password === "owner") {
          localStorage.setItem("admin_token", "mock_owner_token_sspi_checksum");
          localStorage.setItem("admin_role", "MAIN_ADMIN");
          localStorage.setItem("admin_name", "Main Admin Owner");
          localStorage.setItem("admin_user_id", "22222222-2222-2222-2222-222222222222");
          router.push("/dashboard");
        } else if (username === "staff" && password === "staff") {
          localStorage.setItem("admin_token", "mock_staff_token_sspi_checksum");
          localStorage.setItem("admin_role", "LAB_TECHNICIAN");
          localStorage.setItem("admin_name", "Staff Lab Technician Demo");
          localStorage.setItem("admin_user_id", "11111111-1111-1111-1111-111111111111");
          router.push("/dashboard");
        } else if (username === "collector" && password === "collector") {
          localStorage.setItem("admin_token", "mock_collector_token_sspi_checksum");
          localStorage.setItem("admin_role", "PHLEBOTOMIST");
          localStorage.setItem("admin_name", "Home Collector Team");
          localStorage.setItem("admin_user_id", "33333333-3333-3333-3333-333333333333");
          router.push("/dashboard");
        } else {
          setError(err.message || "Network error. Try 'owner' / 'owner', 'admin' / 'admin', 'staff' / 'staff', or 'collector' / 'collector'.");
        }
      } else {
        setError(err.message || "Authentication failed or server is unreachable. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white border-r border-slate-200">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8 py-10">
          <div className="text-left space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
              V
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-4">
              Vicky Staff Portal
            </h2>
            <p className="text-xs text-slate-500">
              Administrative, Support, and Laboratory Staff Access.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-md">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. owner or admin"
                className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-md transition-standard shadow disabled:opacity-50 interactive-target cursor-pointer"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed space-y-1">
            <p>ℹ️ <strong>Demo Access Credentials:</strong></p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>For **Main Admin (Owner)**: Use username <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">owner</strong> and password <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">owner</strong>.</li>
              <li>For **Support Admin**: Use username <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">admin</strong> and password <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">admin</strong>.</li>
              <li>For **Lab Staff / Technicians**: Use username <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">staff</strong> and password <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">staff</strong>.</li>
              <li>For **Home Collector (Phlebotomist)**: Use username <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">collector</strong> and password <strong className="font-mono bg-blue-100/50 px-1 py-0.5 rounded">collector</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side: Lab Technician Image Banner */}
      <div className="hidden lg:block relative flex-1 w-0 bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>
        <img 
          src="/lab_technician.png" 
          alt="Laboratory Technician at Work" 
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Medical Diagnosis</p>
          <h3 className="text-xl font-bold">Accuracy. Velocity. Professionalism.</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md">
            Simulate path lab technician report uploads, handle real-time patient reviews moderation, and review corporate inquiries from our unified pipeline log.
          </p>
        </div>
      </div>
    </div>
  );
}
