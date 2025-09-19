import { useMemo } from "react";

type NavItem = {
  label: string;
  icon: React.ReactElement;
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
      {
        label: "Dashboard",
        icon: (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-label="Dashboard">
            <rect x="3" y="3" width="7" height="7" rx="2" fill="#67e8f9" />
            <rect x="14" y="3" width="7" height="7" rx="2" fill="#818cf8" />
            <rect x="14" y="14" width="7" height="7" rx="2" fill="#67e8f9" />
            <rect x="3" y="14" width="7" height="7" rx="2" fill="#818cf8" />
            <title>Dashboard</title>
          </svg>
        ),
        active: active === "dashboard",
      },
      {
        label: "Alerts",
        icon: (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-label="Alerts">
            <path d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.07-6.93l-.71.71M6.34 17.66l-.71.71m12.02 0l-.71-.71M6.34 6.34l-.71-.71" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="5" fill="#f87171" />
            <title>Alerts</title>
          </svg>
        ),
        active: active === "alerts",
      },
    ],
    [active]
  );

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 space-y-4">
        <div className="glass-card p-4">
          <div className="mb-3 font-semibold text-cyan-200 text-xs uppercase tracking-wide">
            Menu
          </div>
          <nav className="space-y-2">
            {items.map((item) => (
              <button
                aria-current={item.active ? "page" : undefined}
                className={`relative flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                  item.active
                    ? "border-cyan-400 bg-cyan-900/30 text-cyan-100 shadow"
                    : "border-transparent bg-transparent text-cyan-300 hover:bg-cyan-900/10"
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
                  className={`-translate-y-1/2 absolute top-1/2 left-0 h-6 w-1 rounded-r ${item.active ? "bg-cyan-400" : "bg-transparent"}`}
                />
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="glass-card p-4">
          <div className="mb-2 font-semibold text-cyan-100 text-sm">
            Water Quality Tip
          </div>
          <p className="text-cyan-300 text-xs">
            Keep turbidity under 5 NTU for safer drinking water.
          </p>
        </div>
      </div>
    </aside>
  );
}
