/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { ReactElement } from "react";
import { useState } from "react";


type Alert = {
  id: number;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  time: string;
};


const alertsData: Alert[] = [
  { id: 1, type: "High pH", message: "pH level is above the safe threshold.", severity: "high", time: "2025-09-20 10:00" },
  { id: 2, type: "Low Turbidity", message: "Turbidity is below the expected range.", severity: "medium", time: "2025-09-20 09:30" },
  { id: 3, type: "Sensor Offline", message: "Sensor 4 is not responding.", severity: "critical", time: "2025-09-20 09:00" },
  { id: 4, type: "Normal", message: "All parameters are within safe limits.", severity: "low", time: "2025-09-20 08:30" },
  { id: 5, type: "High Conductivity", message: "Conductivity is above the safe threshold.", severity: "medium", time: "2025-09-20 08:00" },
  { id: 6, type: "Low DO", message: "Dissolved Oxygen is below the safe threshold.", severity: "high", time: "2025-09-20 07:30" },
  { id: 7, type: "High Temperature", message: "Temperature is above the safe threshold.", severity: "medium", time: "2025-09-20 07:00" },
  { id: 8, type: "Low pH", message: "pH level is below the safe threshold.", severity: "high", time: "2025-09-20 06:30" },
  { id: 9, type: "High Turbidity", message: "Turbidity is above the expected range.", severity: "medium", time: "2025-09-20 06:00" },
  { id: 10, type: "Sensor Battery Low", message: "Sensor 2 battery is low.", severity: "low", time: "2025-09-20 05:30" },
];

const pageSize = 3;

const severityIcons: Record<string, ReactElement> = {
  low: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Low severity"><circle cx="12" cy="12" r="10" fill="#22c55e" /><title>Low severity</title></svg>
  ),
  medium: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Medium severity"><circle cx="12" cy="12" r="10" fill="#facc15" /><title>Medium severity</title></svg>
  ),
  high: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="High severity"><circle cx="12" cy="12" r="10" fill="#f97316" /><title>High severity</title></svg>
  ),
  critical: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Critical severity"><circle cx="12" cy="12" r="10" fill="#ef4444" /><title>Critical severity</title></svg>
  ),
};

function AlertsPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(alertsData.length / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const currentAlerts = alertsData.slice(startIdx, endIdx);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Pagination: 1, ..., current-1, current, current+1, ..., last
  const getPageButtons = () => {
    const buttons = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1);
      if (page > 3) {
        buttons.push('...');
      }
      // Show current-1, current, current+1
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(i);
        }
      }
      if (page < totalPages - 2) {
        buttons.push('...');
      }
      buttons.push(totalPages);
    }
    return buttons;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="dashboard-title mb-6 text-left">Alerts</h2>
      <div className="rounded-xl border border-[#232b3e] bg-[#181e2a] shadow-sm overflow-hidden">
        <div style={{ maxHeight: 320, overflowY: 'auto' }} className="custom-scrollbar">
          <table className="dashboard-table min-w-full text-left">
            <thead className="bg-[#101624]">
              <tr>
                <th className="px-5 py-3 text-cyan-300 font-semibold">Severity</th>
                <th className="px-5 py-3 text-cyan-300 font-semibold">Type</th>
                <th className="px-5 py-3 text-cyan-300 font-semibold">Message</th>
                <th className="px-5 py-3 text-cyan-300 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {currentAlerts.map((alert: Alert) => (
                <tr key={alert.id} className="hover:bg-[#232b3e] transition">
                  <td className="px-5 py-4 align-middle">{severityIcons[alert.severity]}</td>
                  <td className="px-5 py-4 align-middle font-semibold text-cyan-200">{alert.type}</td>
                  <td className="px-5 py-4 align-middle text-cyan-100">{alert.message}</td>
                  <td className="px-5 py-4 align-middle text-xs text-cyan-400">{alert.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex text-black justify-center mt-8 gap-2 flex-wrap">
        <button
          className="dashboard-btn border border-cyan-700/40 disabled:opacity-50 focus:ring-2 focus:ring-cyan-400"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><title>Previous</title></svg>
        </button>
        {getPageButtons().map((btn, idx) =>
          btn === '...'
            ? <span key={"ellipsis-" + idx} className="px-2 py-2 text-cyan-400">...</span>
            : <button
                key={btn}
                className={`dashboard-btn border transition-colors duration-150
                  ${page === btn
                    ? "bg-[#232b3e] text-cyan-200 border-cyan-400 shadow-md"
                    : "bg-[#181e2a] text-cyan-400 border-cyan-700 hover:bg-[#232b3e] hover:text-cyan-200"}
                  focus:ring-2 focus:ring-cyan-400`}
                onClick={() => handlePageChange(Number(btn))}
                aria-current={page === btn ? "page" : undefined}
              >
                {btn}
              </button>
        )}
        <button
          className="dashboard-btn border border-cyan-700/40 disabled:opacity-50 focus:ring-2 focus:ring-cyan-400"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7 5l5 5-5 5" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><title>Next</title></svg>
        </button>
      </div>
    </div>
  );
}

export default AlertsPage;