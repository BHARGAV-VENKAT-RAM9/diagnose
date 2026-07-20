import React from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  status: string;
}

interface ReviewsTabProps {
  reviews: Review[];
  approveReview: (id: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews, approveReview }) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Patient Reviews Approval Queue</h3>
        <p className="text-[10px] text-slate-400 font-normal">Moderate user-submitted testimonials before publishing to the main site.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">{r.name}</span>
                <span className="text-amber-400 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              </div>
              <p className="text-xs text-slate-600 italic">"{r.text}"</p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => approveReview(r.id)}
                className="flex-1 py-1.5 bg-accent hover:bg-accent-hover text-white text-[10px] font-bold rounded shadow transition-all cursor-pointer"
              >
                ✓ Approve & Publish
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-slate-50 border rounded-lg">
            <p className="text-xs text-slate-400">All reviews moderated. Approval queue is clean.</p>
          </div>
        )}
      </div>
    </div>
  );
};
