import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { useState } from "react";

export function AlertsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Show 5 alerts per page
  
  const alertsData = useQuery(api.waterMonitoring.getActiveAlerts, { 
    page: currentPage, 
    pageSize 
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
      <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Alerts</h2>
        <p className="text-sm text-slate-700">Review and acknowledge system alerts.</p>
      </div>

      <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            {pagination && (
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} alerts
              </p>
            )}
          </div>
        </div>
        
        {(!alerts || alerts.length === 0) && (
          <p className="text-sm text-slate-700">No active alerts.</p>
        )}
        
        <ScrollArea className="h-96 mb-4">
          <div className="space-y-3 pr-4">
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
        </ScrollArea>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
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


