import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WaterMonitoringDashboard() {
  const waterQuality = useQuery(api.waterMonitoring.getLatestWaterQuality);
  const diseaseRisk = useQuery(api.waterMonitoring.getLatestDiseaseRisk);
  const alerts = useQuery(api.waterMonitoring.getActiveAlerts);
  // Fetch last 7 days of readings for high-level daily overview
  const recentReadings = useQuery(api.waterMonitoring.getRecentReadings, { hours: 24 * 7 });
  
  const simulateReading = useMutation(api.waterMonitoring.simulateWaterQualityReading);
  const acknowledgeAlert = useMutation(api.waterMonitoring.acknowledgeAlert);

  const [isSimulating, setIsSimulating] = useState(false);

  // Auto-simulate readings every 30 seconds for demo
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSimulating) {
        setIsSimulating(true);
        try {
          await simulateReading();
        } catch (error) {
          console.error("Failed to simulate reading:", error);
        } finally {
          setIsSimulating(false);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [simulateReading, isSimulating]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert({ alertId: alertId as any });
      toast.success("Alert acknowledged");
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const handleManualSimulation = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    try {
      await simulateReading();
      toast.success("New water quality reading generated");
    } catch (error) {
      toast.error("Failed to generate reading");
    } finally {
      setIsSimulating(false);
    }
  };

  if (!waterQuality || !diseaseRisk) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
          <div className="text-slate-700">Initializing water monitoring…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 xl:col-span-9 space-y-6">
        {/* Header with Status */}
        <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Water Quality Dashboard</h2>
              <p className="text-slate-700 mt-1">Last updated: {new Date(waterQuality.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <SystemStatus overallRisk={diseaseRisk.overallRisk} />
              <button
                onClick={handleManualSimulation}
                disabled={isSimulating}
                className="px-4 py-2 text-sm rounded-xl text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 shadow"
              >
                {isSimulating ? "Updating..." : "Update Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Water Quality Metrics */}
        <WaterQualityMetrics waterQuality={waterQuality} />

        {/* Disease Risk Assessment */}
        <DiseaseRiskPanel diseaseRisk={diseaseRisk} />

        {/* Trends - show high-level overview over previous days */}
        {recentReadings && recentReadings.length > 0 && (
          <TrendsPanel readings={recentReadings} />
        )}
      </div>

      {/* Right rail intentionally left empty since alerts moved to Alerts page */}
    </div>
  );
}

function SystemStatus({ overallRisk }: { overallRisk: string }) {
  const statusConfig = {
    low: { color: "text-emerald-800", badge: "bg-emerald-50", icon: "✓", label: "System Normal" },
    medium: { color: "text-amber-800", badge: "bg-amber-50", icon: "⚠", label: "Caution Required" },
    high: { color: "text-rose-800", badge: "bg-rose-50", icon: "⚠", label: "High Risk Alert" },
  } as const;

  const config = statusConfig[overallRisk as keyof typeof statusConfig];

  return (
    <div className={`px-4 py-2 rounded-xl flex items-center space-x-2 border border-slate-200 ${config.badge}`}>
      <span className={`text-lg ${config.color}`}>{config.icon}</span>
      <span className={`font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
}

// Alerts moved to dedicated AlertsPage

function WaterQualityMetrics({ waterQuality }: { waterQuality: any }) {
  const metrics = [
    {
      name: "pH Level",
      value: waterQuality.ph.toFixed(2),
      unit: "",
      status: waterQuality.status.ph,
      icon: "🧪",
      range: "6.5-8.5",
    },
    {
      name: "Turbidity",
      value: waterQuality.turbidity.toFixed(1),
      unit: "NTU",
      status: waterQuality.status.turbidity,
      icon: "💧",
      range: "< 5 NTU",
    },
    {
      name: "Temperature",
      value: waterQuality.temperature.toFixed(1),
      unit: "°C",
      status: waterQuality.status.temperature,
      icon: "🌡️",
      range: "15-25°C",
    },
    {
      name: "Dissolved Oxygen",
      value: waterQuality.dissolvedOxygen.toFixed(1),
      unit: "mg/L",
      status: waterQuality.status.dissolvedOxygen,
      icon: "🫧",
      range: "> 5 mg/L",
    },
    {
      name: "Total Coliform",
      value: waterQuality.totalColiform.toString(),
      unit: "CFU/100ml",
      status: waterQuality.status.totalColiform,
      icon: "🦠",
      range: "0 CFU/100ml",
    },
    {
      name: "E. coli",
      value: waterQuality.ecoli.toString(),
      unit: "CFU/100ml",
      status: waterQuality.status.ecoli,
      icon: "🔬",
      range: "0 CFU/100ml",
    },
    {
      name: "Chlorine",
      value: waterQuality.chlorine.toFixed(2),
      unit: "mg/L",
      status: waterQuality.status.chlorine,
      icon: "⚗️",
      range: "0.2-5 mg/L",
    },
  ];

  return (
    <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Water Quality Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.name} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: any }) {
  const statusColors: Record<string, string> = {
    good: "text-emerald-800 bg-emerald-50 border-emerald-200",
    warning: "text-amber-800 bg-amber-50 border-amber-200",
    critical: "text-rose-800 bg-rose-50 border-rose-200",
  };

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${statusColors[metric.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{metric.icon}</span>
        <div className={`w-3 h-3 rounded-full ${
          metric.status === "good" ? "bg-emerald-500" :
          metric.status === "warning" ? "bg-amber-500" : "bg-rose-500"
        }`}></div>
      </div>
      <h4 className="font-medium text-sm mb-1 text-slate-900">{metric.name}</h4>
      <div className="text-2xl font-bold mb-1 text-slate-900">
        {metric.value} <span className="text-sm font-normal text-slate-700">{metric.unit}</span>
      </div>
      <p className="text-xs text-slate-700">Safe: {metric.range}</p>
    </div>
  );
}

function DiseaseRiskPanel({ diseaseRisk }: { diseaseRisk: any }) {
  const diseases = [
    { name: "Cholera", data: diseaseRisk.cholera, icon: "🦠" },
    { name: "Typhoid", data: diseaseRisk.typhoid, icon: "🤒" },
    { name: "Hepatitis A", data: diseaseRisk.hepatitisA, icon: "🫀" },
    { name: "Diarrhea", data: diseaseRisk.diarrhea, icon: "💊" },
  ];

  return (
    <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Disease Risk Assessment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {diseases.map((disease) => (
          <DiseaseRiskCard key={disease.name} disease={disease} />
        ))}
      </div>
    </div>
  );
}

function DiseaseRiskCard({ disease }: { disease: any }) {
  const riskColors: Record<string, string> = {
    low: "text-emerald-800 bg-emerald-50/80 border-emerald-200",
    medium: "text-amber-800 bg-amber-50/80 border-amber-200",
    high: "text-rose-800 bg-rose-50/80 border-rose-200",
  };

  const probability = Math.round(disease.data.probability * 100);
  const confidence = Math.round(disease.data.confidence * 100);

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${riskColors[disease.data.riskLevel]}`}> 
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{disease.icon}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          disease.data.riskLevel === "low" ? "bg-emerald-100 text-emerald-800" :
          disease.data.riskLevel === "medium" ? "bg-amber-100 text-amber-800" :
          "bg-rose-100 text-rose-800"
        }`}>
          {disease.data.riskLevel.toUpperCase()}
        </span>
      </div>
      <h4 className="font-semibold mb-2">{disease.name}</h4>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Risk Probability</span>
            <span className="font-medium">{probability}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                disease.data.riskLevel === "low" ? "bg-emerald-500" :
                disease.data.riskLevel === "medium" ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${probability}%` }}
            ></div>
          </div>
        </div>
        <div className="text-xs text-slate-700">
          Confidence: {confidence}%
        </div>
      </div>
    </div>
  );
}

function TrendsPanel({ readings }: { readings: any[] }) {
  // Aggregate to daily statistics (min/avg/max) for previous days
  const byDay = readings.reduce<Record<string, { ph: number[]; turbidity: number[] }>>((acc, r: any) => {
    const day = new Date(r.timestamp).toISOString().slice(0, 10);
    if (!acc[day]) acc[day] = { ph: [], turbidity: [] };
    acc[day].ph.push(r.ph);
    acc[day].turbidity.push(r.turbidity);
    return acc;
  }, {});

  const days = Object.keys(byDay)
    .sort((a, b) => (a < b ? 1 : -1)) // newest first
    .slice(0, 7) // last up to 7 days
    .reverse(); // display oldest to newest on chart

  const phDaily = days.map((d) => {
    const arr = byDay[d].ph;
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    return { time: d, min: Math.min(...arr), avg, max: Math.max(...arr) };
  });
  const turbidityDaily = days.map((d) => {
    const arr = byDay[d].turbidity;
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    return { time: d, min: Math.min(...arr), avg, max: Math.max(...arr) };
  });

  return (
    <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Trends Overview (Previous Days)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyOverviewChart title="pH Levels" data={phDaily} color="blue" unit="" />
        <DailyOverviewChart title="Turbidity" data={turbidityDaily} color="cyan" unit="NTU" />
      </div>
    </div>
  );
}

function DailyOverviewChart({ title, data, color, unit }: { title: string, data: { time: string; min: number; avg: number; max: number }[], color: string, unit: string }) {
  if (data.length === 0) return null;

  const allValues = data.flatMap(d => [d.min, d.avg, d.max]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;

  const gradientId = `grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <h4 className="font-medium text-slate-900 mb-3">{title}</h4>
      <div className="relative h-40 rounded-xl p-4 border border-slate-200 bg-white">
        <svg className="w-full h-full" viewBox="0 0 320 120">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color === "blue" ? "#0284c7" : "#06b6d4"} />
              <stop offset="100%" stopColor={color === "blue" ? "#0ea5e9" : "#67e8f9"} />
            </linearGradient>
          </defs>
          {data.map((point, index) => {
            const x = (index / (data.length - 1 || 1)) * 300 + 10;
            const yMin = 110 - ((point.min - minValue) / range) * 100;
            const yAvg = 110 - ((point.avg - minValue) / range) * 100;
            const yMax = 110 - ((point.max - minValue) / range) * 100;
            return (
              <g key={index}>
                <line x1={x} y1={yMin} x2={x} y2={yMax} stroke={`url(#${gradientId})`} strokeWidth="3" />
                <circle cx={x} cy={yAvg} r="4" fill={color === "blue" ? "#0284c7" : "#06b6d4"} />
              </g>
            );
          })}
        </svg>
        <div className="absolute top-2 right-2 text-xs text-slate-700">Daily min–avg–max {unit}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-700">
        {data.map((d) => (
          <div key={d.time} className="rounded bg-slate-50 border border-slate-200 p-2">
            <div className="font-medium">{d.time}</div>
            <div>Min: {d.min.toFixed(2)} {unit}</div>
            <div>Avg: {d.avg.toFixed(2)} {unit}</div>
            <div>Max: {d.max.toFixed(2)} {unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
