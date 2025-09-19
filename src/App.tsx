import { Toaster } from "sonner";
import { WaterMonitoringDashboard } from "./components/WaterMonitoringDashboard";
import { Sidebar } from "./components/Sidebar";
import { useState } from "react";
import { AlertsPage } from "@/components/AlertsPage";

export default function App() {
  const [activePage, setActivePage] = useState<"dashboard" | "alerts">("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const NavButtons = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setActivePage("dashboard")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activePage === "dashboard"
            ? "text-white bg-sky-600/90 shadow"
            : "text-white/90 hover:text-white hover:bg-white/10"
        }`}
      >
        Dashboard
      </button>
      <button
        onClick={() => setActivePage("alerts")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activePage === "alerts"
            ? "text-white bg-sky-600/90 shadow"
            : "text-white/90 hover:text-white hover:bg-white/10"
        }`}
      >
        Alerts
      </button>
    </div>
  );

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-b from-sky-50 via-cyan-50 to-white overflow-hidden">
      {/* Background ornaments */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300 via-cyan-300 to-blue-300 opacity-30 blur-3xl motion-safe:animate-pulse"></div>
      <div className="pointer-events-none absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-200 via-sky-200 to-cyan-200 opacity-40 blur-3xl motion-safe:animate-pulse"></div>

      <header className="sticky top-0 z-30">
        <div className="backdrop-blur supports-[backdrop-filter]:bg-white/10 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 text-white border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Open navigation"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 border border-white/30 shadow">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold">Smart Water Monitor</h1>
                  <p className="text-xs sm:text-sm text-white/80">Village Health System</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-2">
                <NavButtons />
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileNavOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-md border-r border-slate-200 shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-600 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900">Menu</span>
              </div>
              <button
                className="p-2 rounded-md hover:bg-slate-100"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
              >
                <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActivePage("dashboard");
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left border transition ${
                  activePage === "dashboard"
                    ? "bg-sky-600 text-white border-sky-600 shadow"
                    : "bg-white/70 hover:bg-slate-50 text-slate-800 border-slate-200"
                }`}
              >
                <span className="text-lg">🏠</span>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setActivePage("alerts");
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left border transition ${
                  activePage === "alerts"
                    ? "bg-sky-600 text-white border-sky-600 shadow"
                    : "bg-white/70 hover:bg-slate-50 text-slate-800 border-slate-200"
                }`}
              >
                <span className="text-lg">🔔</span>
                <span className="text-sm font-medium">Alerts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            <Sidebar active={activePage} onNavigate={(p) => setActivePage(p as any)} />
            <div className="flex-1">
              {activePage === "dashboard" ? (
                <WaterMonitoringDashboard />
              ) : (
                <AlertsPage />
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
