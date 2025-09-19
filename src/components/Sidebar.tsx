import { useMemo } from "react";

type NavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

export function Sidebar({
  active = "dashboard",
  onNavigate,
}: {
  active?: "dashboard" | "alerts";
  onNavigate?: (route: "dashboard" | "alerts") => void;
}) {
  const items = useMemo<NavItem[]>(
    () => [
      { label: "Dashboard", icon: "🏠", active: active === "dashboard" },
      { label: "Alerts", icon: "🔔", active: active === "alerts" },
    ],
    [active]
  );

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 font-semibold text-slate-700 text-xs uppercase tracking-wide">
            Menu
          </div>
          <nav className="space-y-2">
            {items.map((item) => (
              <button
                aria-current={item.active ? "page" : undefined}
                className={`relative flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                  item.active
                    ? "border-transparent bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow"
                    : "border-slate-200 bg-white/70 text-slate-800 hover:bg-white/90"
                }`}
                key={item.label}
                onClick={() =>
                  onNavigate?.(
                    item.label.toLowerCase() as "dashboard" | "alerts"
                  )
                }
                type="button"
              >
                <span
                  className={`-translate-y-1/2 absolute top-1/2 left-0 h-6 w-1 rounded-r ${item.active ? "bg-white/80" : "bg-transparent"}`}
                />
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 backdrop-blur">
          <div className="mb-2 font-semibold text-slate-900 text-sm">
            Water Quality Tip
          </div>
          <p className="text-slate-700 text-xs">
            Keep turbidity under 5 NTU for safer drinking water.
          </p>
        </div>
      </div>
    </aside>
  );
}
