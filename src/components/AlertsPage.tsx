import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AlertsPage() {
  const alerts = useQuery(api.waterMonitoring.getActiveAlerts);
  const acknowledgeAlert = useMutation(api.waterMonitoring.acknowledgeAlert);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert({ alertId: id as any });
      toast.success("Alert acknowledged");
    } catch {
      toast.error("Failed to acknowledge alert");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Alerts</h2>
        <p className="text-sm text-slate-700">Review and acknowledge system alerts.</p>
      </div>

      <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
        {(!alerts || alerts.length === 0) && (
          <p className="text-sm text-slate-700">No active alerts.</p>
        )}
        <div className="space-y-3">
          {alerts?.map((alert) => (
            <div key={alert._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-700">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    className="px-3 py-1.5 text-sm rounded-lg text-white bg-sky-600 hover:bg-sky-700"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


