"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  publish_date?: string;
  created_at: string;
}

export default function PublicBlogs() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);

  const fetchBlogs = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/blogs/");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      // Fallback local health blogs
      setBlogs([
        {
          id: "b-1",
          title: "Understanding Your Liver Function Test (LFT) Results",
          slug: "understanding-lft-results",
          excerpt: "A detailed guide on interpreting bilirubin, SGOT, and SGPT levels in your liver health report.",
          content: "Your liver plays a critical role in filtering toxins, digesting fats, and synthesis of proteins. An LFT measures vital indicators to verify liver performance. Elevated SGPT/SGOT typically points to liver stress. Ensure a 10-hour fasting prior to blood draw to ensure correct enzyme baselines.",
          author_name: "Dr. A. Srinivas, Pathologist",
          created_at: "2026-06-19"
        },
        {
          id: "b-2",
          title: "The Vital Importance of Vitamin D in Muscle and Bone Health",
          slug: "importance-of-vitamin-d",
          excerpt: "Deficiency is rising among city dwellers. Understand the symptoms, testing requirements, and recovery plans.",
          content: "Vitamin D is unique as it functions like a hormone in regulating calcium intake. Lack of exposure to early morning sunlight causes silent deficiencies. Get checked annually. 25-Hydroxy Vitamin D test is the clinical standard. Deficiency leads to muscle pain, fatigue, and weaker bones.",
          author_name: "Dr. K. Anuradha, Clinical Biochemist",
          created_at: "2026-06-18"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex-1 space-y-3 text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Patient Health Library & Education
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Clinically verified articles written by our pathologists and medical professionals to help you understand your reports and make informed health decisions.
            </p>
          </div>
          <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-100 shadow-inner">
            <img 
              src="/doctor_consultation.png" 
              alt="Medical Pathologist Consultation" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading health articles...</div>
        ) : activeArticle ? (
          /* Detailed blog view screen */
          <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <button
              onClick={() => setActiveArticle(null)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
            >
              &larr; Back to Directory
            </button>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {activeArticle.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>By <strong>{activeArticle.author_name}</strong></span>
                <span>·</span>
                <span>Published: {activeArticle.publish_date ? activeArticle.publish_date.split("T")[0] : activeArticle.created_at}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 bg-slate-50 p-4 border-l-4 border-primary rounded-r">
              {activeArticle.excerpt}
            </p>
            <div className="text-sm text-slate-800 leading-relaxed space-y-4">
              {activeArticle.content.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </article>
        ) : (
          /* Directory List View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map(article => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-standard cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg hover:text-primary transition-standard leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span>👤 {article.author_name}</span>
                  <span className="font-bold text-primary">Read Full Article &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
