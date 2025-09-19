/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { ScrollArea } from "./ui/scroll-area";

export function AlertsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Show 5 alerts per page

  const alertsData = useQuery(api.waterMonitoring.getActiveAlerts, {
    page: currentPage,
    pageSize,
  });
  const acknowledgeAlert = useMutation(api.waterMonitoring.acknowledgeAlert);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert({ alertId: id as any });
      toast.success("Alert acknowledged");
    } catch {
      toast.error("Failed to acknowledge alert");
    }
  };

  const alerts = alertsData?.alerts || [];
  const pagination = alertsData?.pagination;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <h2 className="font-semibold text-slate-900 text-xl">Alerts</h2>
        <p className="text-slate-700 text-sm">
          Review and acknowledge system alerts.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            {pagination && (
              <p className="text-slate-600 text-sm">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, pagination.totalCount)} of{" "}
                {pagination.totalCount} alerts
              </p>
            )}
          </div>
        </div>

        {(!alerts || alerts.length === 0) && (
          <p className="text-slate-700 text-sm">No active alerts.</p>
        )}

        <ScrollArea className="mb-4 h-96">
          <div className="space-y-3 pr-4">
            {alerts?.map((alert) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                key={alert._id}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {alert.message}
                    </p>
                    <p className="text-slate-700 text-xs">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
                      onClick={() => handleAcknowledge(alert._id)}
                      type="button"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      pagination.hasPrev
                        ? "cursor-pointer"
                        : "pointer-events-none opacity-50"
                    }
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className={
                      pagination.hasNext
                        ? "cursor-pointer"
                        : "pointer-events-none opacity-50"
                    }
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.totalPages, prev + 1)
                      )
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
