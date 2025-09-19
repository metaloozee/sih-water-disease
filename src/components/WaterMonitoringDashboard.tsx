import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WaterMonitoringDashboard() {
  const waterQuality = useQuery(api.waterMonitoring.getLatestWaterQuality);
  const diseaseRisk = useQuery(api.waterMonitoring.getLatestDiseaseRisk);
  const alerts = useQuery(api.waterMonitoring.getActiveAlerts);
  const recentReadings = useQuery(api.waterMonitoring.getRecentReadings, { hours: 24 });
  
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
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Initializing Water Monitoring System</h2>
          <button
            onClick={handleManualSimulation}
            disabled={isSimulating}
            className="px-6 py-3 rounded-xl text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 shadow"
          >
            {isSimulating ? "Generating..." : "Generate Initial Reading"}
          </button>
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

        {/* Recent Trends */}
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
  const last6Hours = readings.slice(0, 12); // Assuming readings every 30 minutes

  return (
    <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Trends (Last 6 Hours)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="pH Levels"
          data={last6Hours.map(r => ({ time: r.timestamp, value: r.ph }))}
          color="blue"
          unit=""
        />
        <TrendChart
          title="Turbidity"
          data={last6Hours.map(r => ({ time: r.timestamp, value: r.turbidity }))}
          color="cyan"
          unit="NTU"
        />
      </div>
    </div>
  );
}

function TrendChart({ title, data, color, unit }: { title: string, data: any[], color: string, unit: string }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  // Use stable id to avoid duplicate ids when multiple charts have same title
  const gradientId = `grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <h4 className="font-medium text-slate-900 mb-3">{title}</h4>
      <div className="relative h-32 rounded-xl p-4 border border-slate-200 bg-white">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color === "blue" ? "#0284c7" : "#06b6d4"} />
              <stop offset="100%" stopColor={color === "blue" ? "#0ea5e9" : "#67e8f9"} />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 280 + 10;
              const y = 90 - ((point.value - minValue) / range) * 80;
              return `${x},${y}`;
            }).join(" ")}
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 280 + 10;
            const y = 90 - ((point.value - minValue) / range) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color === "blue" ? "#0284c7" : "#06b6d4"}
              />
            );
          })}
        </svg>
        <div className="absolute top-2 right-2 text-sm text-slate-700">
          Latest: {data[0]?.value.toFixed(2)} {unit}
        </div>
      </div>
    </div>
  );
}
