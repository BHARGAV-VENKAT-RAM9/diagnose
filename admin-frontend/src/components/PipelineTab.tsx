import React from "react";

interface Booking {
  id: string;
  patient_name: string;
  phone: string;
  booking_type: string;
  status: string;
  slot_time: string;
  total_amount: number;
  payment_status: string;
  tests: string[];
  report_id?: string;
}

interface PipelineTabProps {
  bookings: Booking[];
  updateBookingStatus: (bookingId: string, nextStatus: string) => void;
  handleApproveReport: (reportId: string, bookingId: string) => void;
  handleSendWhatsApp: (booking: any) => void;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({
  bookings,
  updateBookingStatus,
  handleApproveReport,
  handleSendWhatsApp
}) => {
  return (
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
                className="w-full mt-2 py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-hover cursor-pointer"
              >
                Mark Sample Collected &rarr;
              </button>
            </div>
          ))}
          {bookings.filter(b => b.status === "CONFIRMED").length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No confirmed bookings.</p>
          )}
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
          {bookings.filter(b => b.status === "SAMPLE_COLLECTED" || b.status === "PROCESSING").length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No active samples processing in lab.</p>
          )}
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
                ✓ Approve & Notify Patient
              </button>
              <button
                onClick={() => handleSendWhatsApp(b)}
                className="w-full mt-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
              >
                💬 Send on WhatsApp
              </button>
            </div>
          ))}
          {bookings.filter(b => b.status === "REPORT_UPLOADED").length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No reports pending approval.</p>
          )}
        </div>
      </div>
    </div>
  );
};
