import { useState } from "react";
import { Toaster } from "sonner";
import { AlertsPage } from "@/components/AlertsPage";
import { Sidebar } from "./components/Sidebar";
import { WaterMonitoringDashboard } from "./components/WaterMonitoringDashboard";

// Navigation buttons component extracted outside of App to follow React best practices
const NavButtons = ({
  activePage,
  setActivePage,
}: {
  activePage: "dashboard" | "alerts";
  setActivePage: (page: "dashboard" | "alerts") => void;
}) => (
  <div className="flex items-center gap-2">
    <button
      className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
        activePage === "dashboard"
          ? "bg-sky-600/90 text-white shadow"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      }`}
      onClick={() => setActivePage("dashboard")}
      type="button"
    >
      Dashboard
    </button>
    <button
      className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
        activePage === "alerts"
          ? "bg-sky-600/90 text-white shadow"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      }`}
      onClick={() => setActivePage("alerts")}
      type="button"
    >
      Alerts
    </button>
  </div>
);

export default function App() {
  const [activePage, setActivePage] = useState<"dashboard" | "alerts">(
    "dashboard"
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleMobileNavToggle = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setMobileNavOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleMobileNavClose();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-sky-50 via-cyan-50 to-white">
      {/* Background ornaments */}
      <div className="-top-24 -right-24 pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-br from-sky-300 via-cyan-300 to-blue-300 opacity-30 blur-3xl motion-safe:animate-pulse" />
      <div className="-left-24 pointer-events-none absolute top-1/3 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-200 via-sky-200 to-cyan-200 opacity-40 blur-3xl motion-safe:animate-pulse" />

      <header className="sticky top-0 z-30">
        <div className="border-white/20 border-b bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 text-white backdrop-blur supports-[backdrop-filter]:bg-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Open navigation"
                  className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
                  onClick={handleMobileNavToggle}
                  type="button"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <title>Menu</title>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Water Monitor Logo</title>
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-semibold text-lg sm:text-xl">
                    Smart Water Monitor
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Village Health System
                  </p>
                </div>
              </div>

              <nav className="hidden items-center gap-2 md:flex">
                <NavButtons
                  activePage={activePage}
                  setActivePage={setActivePage}
                />
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 cursor-pointer border-0 bg-slate-900/50 p-0"
            onClick={handleMobileNavClose}
            onKeyDown={handleKeyDown}
            type="button"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-slate-200 border-r bg-white/90 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Menu Logo</title>
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900">Menu</span>
              </div>
              <button
                aria-label="Close navigation"
                className="rounded-md p-2 hover:bg-slate-100"
                onClick={handleMobileNavClose}
                type="button"
              >
                <svg
                  className="h-5 w-5 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <title>Close</title>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <button
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  activePage === "dashboard"
                    ? "border-sky-600 bg-sky-600 text-white shadow"
                    : "border-slate-200 bg-white/70 text-slate-800 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setActivePage("dashboard");
                  setMobileNavOpen(false);
                }}
                type="button"
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium text-sm">Dashboard</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  activePage === "alerts"
                    ? "border-sky-600 bg-sky-600 text-white shadow"
                    : "border-slate-200 bg-white/70 text-slate-800 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setActivePage("alerts");
                  setMobileNavOpen(false);
                }}
                type="button"
              >
                <span className="text-lg">🔔</span>
                <span className="font-medium text-sm">Alerts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Sidebar
              active={activePage}
              onNavigate={(p: "dashboard" | "alerts") => setActivePage(p)}
            />
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
