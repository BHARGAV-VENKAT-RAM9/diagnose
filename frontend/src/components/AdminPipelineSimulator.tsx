import React from "react";

interface AdminBooking {
  id: string;
  patient: string;
  phone: string;
  tests: string[];
  type: string;
  status: string;
  report_uploaded: boolean;
}

interface PendingReview {
  id: string;
  patient_name: string;
  rating: number;
  review_text: string;
}

interface AdminPipelineSimulatorProps {
  showAdminPipeline: boolean;
  setShowAdminPipeline: (show: boolean) => void;
  adminBookings: AdminBooking[];
  handleUploadReportSimulate: (bookingId: string) => void;
  handleApproveReportSimulate: (bookingId: string) => void;
  pendingReviews: PendingReview[];
  handleApproveReview: (reviewId: string) => void;
}

export const AdminPipelineSimulator: React.FC<AdminPipelineSimulatorProps> = ({
  showAdminPipeline,
  setShowAdminPipeline,
  adminBookings,
  handleUploadReportSimulate,
  handleApproveReportSimulate,
  pendingReviews,
  handleApproveReview
}) => {
  if (!showAdminPipeline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowAdminPipeline(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
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
                      className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded cursor-pointer"
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
                      className="flex-1 py-1.5 bg-accent hover:bg-accent-hover text-white font-bold rounded text-[10px] transition-standard cursor-pointer"
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
  );
};
