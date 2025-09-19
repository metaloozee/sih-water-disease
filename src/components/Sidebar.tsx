import { useMemo } from "react";

type NavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

export function Sidebar({ active = "dashboard", onNavigate }: { active?: string; onNavigate?: (route: string) => void }) {
  const items = useMemo<NavItem[]>(
    () => [
      { label: "Dashboard", icon: "🏠", active: active === "dashboard" },
      { label: "Alerts", icon: "🔔", active: active === "alerts" },
    ],
    [active]
  );

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl p-4 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-3">Menu</div>
          <nav className="space-y-2">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate?.(item.label.toLowerCase())}
                aria-current={item.active ? "page" : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors border ${
                  item.active
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-transparent shadow"
                    : "bg-white/70 hover:bg-white/90 text-slate-800 border-slate-200"
                }`}
              >
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r ${item.active ? "bg-white/80" : "bg-transparent"}`}></span>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl p-4 bg-white/60 backdrop-blur border border-slate-200">
          <div className="mb-2 text-sm font-semibold text-slate-900">Water Quality Tip</div>
          <p className="text-xs text-slate-700">Keep turbidity under 5 NTU for safer drinking water.</p>
        </div>
      </div>
    </aside>
  );
}


