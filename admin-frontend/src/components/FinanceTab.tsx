import React from "react";

interface Payment {
  id: string;
  patient_name: string;
  method: string;
  amount: number;
  status: string;
  created_at: string;
}

interface FinanceTabProps {
  payments: Payment[];
  totalRevenue: number;
  handleProcessRefund: (id: string) => void;
  handleMarkPaymentSuccess: (id: string) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  payments,
  totalRevenue,
  handleProcessRefund,
  handleMarkPaymentSuccess
}) => {
  const onlineSuccess = payments
    .filter(p => p.method === "RAZORPAY" && p.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const offlineSuccess = payments
    .filter(p => p.method === "CASH" && p.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === "REFUNDED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Financial Transactions & Refunds</h3>
          <p className="text-xs text-slate-500">Track online Razorpay and offline cash payments</p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-semibold">
          Total Revenue: ₹{totalRevenue}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razorpay (Online)</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">₹{onlineSuccess}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cash at Centre (Offline)</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">₹{offlineSuccess}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Refunded</p>
          <p className="text-xl font-extrabold text-red-600 mt-1">₹{totalRefunded}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b">
            <tr>
              <th className="p-3">Tx ID</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono">{p.id}</td>
                <td className="p-3 font-semibold text-slate-900">{p.patient_name}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    p.method === "RAZORPAY" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-slate-100 text-slate-700"
                  }`}>
                    {p.method}
                  </span>
                </td>
                <td className="p-3 font-mono font-semibold">₹{p.amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    p.status === "SUCCESS" ? "bg-green-100 text-green-800" :
                    p.status === "PENDING" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-red-100 text-red-800"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{p.created_at}</td>
                <td className="p-3 text-right space-x-2">
                  {p.status === "PENDING" && (
                    <button
                      onClick={() => handleMarkPaymentSuccess(p.id)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-[9px] shadow transition-all cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  )}
                  {p.status === "SUCCESS" && (
                    <button
                      onClick={() => handleProcessRefund(p.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[9px] shadow transition-all cursor-pointer"
                    >
                      Process Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">No payment logs recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
