import React from "react";

interface Review {
  id?: string;
  patient_name?: string;
  name?: string;
  rating: number;
  review_text?: string;
  text?: string;
}

interface ReviewsSectionProps {
  approvedReviews: Review[];
  newReview: { patientName: string; rating: number; reviewText: string };
  setNewReview: React.Dispatch<React.SetStateAction<{ patientName: string; rating: number; reviewText: string }>>;
  onSubmitReview: (e: React.FormEvent) => void;
  submittingReview: boolean;
  reviewSubmitMessage: string | null;
  reviewSubmitError: string | null;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  approvedReviews,
  newReview,
  setNewReview,
  onSubmitReview,
  submittingReview,
  reviewSubmitMessage,
  reviewSubmitError
}) => {
  return (
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
              <p className="text-xs text-slate-500 text-center col-span-2 py-8">
                No approved reviews yet. Be the first to write one!
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
            Share Your Experience
          </h3>
          
          <form onSubmit={onSubmitReview} className="space-y-3">
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
  );
};
