"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  Star,
  ShieldAlert,
  CalendarRange,
  ArrowRight,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

type DemandLevel = "High" | "Moderate" | "Low";
type TrendDirection = "up" | "down";
type RiskLevel = "Low" | "Medium" | "High";
type ActionSignal = "Plant More" | "Sell Soon" | "Hold" | "Avoid Expansion";

interface Prediction {
  crop: string;
  targetMonth: string;
  demand: DemandLevel;
  trend: TrendDirection;
  confidence: number;
  demandScore: number;
  risk: RiskLevel;
  bestWindow: string;
  action: ActionSignal;
  priceOutlook: string;
  insight: string;
}

const predictions: Prediction[] = [
  {
    crop: "Tomato",
    targetMonth: "Next Month",
    demand: "High",
    trend: "up",
    confidence: 85,
    demandScore: 88,
    risk: "Medium",
    bestWindow: "7-15 days",
    action: "Sell Soon",
    priceOutlook: "Likely to strengthen in city markets.",
    insight:
      "Festive demand and lower nearby arrivals may keep tomato movement strong for the next few weeks.",
  },
  {
    crop: "Onion",
    targetMonth: "Next 2 Months",
    demand: "Low",
    trend: "down",
    confidence: 92,
    demandScore: 34,
    risk: "High",
    bestWindow: "Immediate dispatch preferred",
    action: "Avoid Expansion",
    priceOutlook: "Oversupply risk is high.",
    insight:
      "Mass arrivals are expected across the state, which can reduce buyer urgency and pressure mandi prices.",
  },
  {
    crop: "Potato",
    targetMonth: "Next Month",
    demand: "Moderate",
    trend: "up",
    confidence: 78,
    demandScore: 61,
    risk: "Medium",
    bestWindow: "2-4 weeks",
    action: "Hold",
    priceOutlook: "Stable with mild upside.",
    insight:
      "Steady urban demand may support prices if cold-storage losses stay low and arrivals remain controlled.",
  },
  {
    crop: "Chilli",
    targetMonth: "Next 2 Months",
    demand: "High",
    trend: "up",
    confidence: 81,
    demandScore: 82,
    risk: "Low",
    bestWindow: "3-6 weeks",
    action: "Plant More",
    priceOutlook: "Strong trader interest expected.",
    insight:
      "Export-oriented buying and tighter quality supply may create stronger margins for good-grade chilli lots.",
  },
  {
    crop: "Brinjal",
    targetMonth: "Next Month",
    demand: "Moderate",
    trend: "down",
    confidence: 73,
    demandScore: 49,
    risk: "Medium",
    bestWindow: "Within 1 week",
    action: "Sell Soon",
    priceOutlook: "Softening in nearby markets.",
    insight:
      "Demand remains active, but fresh local arrivals could keep prices from moving much higher this cycle.",
  },
];

function getDemandTone(demandScore: number) {
  if (demandScore >= 70) return "bg-green-500";
  if (demandScore >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getRiskClasses(risk: RiskLevel) {
  if (risk === "Low") return "border-green-200 bg-green-50 text-green-800";
  if (risk === "Medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-red-200 bg-red-50 text-red-800";
}

export default function PredictionPage() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedHorizon, setSelectedHorizon] = useState("All");
  const [selectedDemand, setSelectedDemand] = useState("All");

  const cropOptions = useMemo(() => ["All", ...new Set(predictions.map((item) => item.crop))], []);
  const horizonOptions = useMemo(
    () => ["All", ...new Set(predictions.map((item) => item.targetMonth))],
    []
  );
  const demandOptions = useMemo(
    () => ["All", ...new Set(predictions.map((item) => item.demand))],
    []
  );

  const filteredPredictions = useMemo(() => {
    return predictions.filter((item) => {
      const cropMatch = selectedCrop === "All" || item.crop === selectedCrop;
      const horizonMatch = selectedHorizon === "All" || item.targetMonth === selectedHorizon;
      const demandMatch = selectedDemand === "All" || item.demand === selectedDemand;
      return cropMatch && horizonMatch && demandMatch;
    });
  }, [selectedCrop, selectedDemand, selectedHorizon]);

  const topPrediction = filteredPredictions.reduce<Prediction | null>((best, current) => {
    if (!best || current.demandScore > best.demandScore) {
      return current;
    }

    return best;
  }, null);

  const lowestPrediction = filteredPredictions.reduce<Prediction | null>((worst, current) => {
    if (!worst || current.demandScore < worst.demandScore) {
      return current;
    }

    return worst;
  }, null);

  const highDemandCount = filteredPredictions.filter((item) => item.demand === "High").length;
  const averageScore = filteredPredictions.length
    ? Math.round(
        filteredPredictions.reduce((total, item) => total + item.demandScore, 0) /
          filteredPredictions.length
      )
    : 0;

  const planningMessage = useMemo(() => {
    if (!topPrediction) {
      return "No prediction matches the current filters.";
    }

    if (topPrediction.demand === "High" && topPrediction.risk === "Low") {
      return `${topPrediction.crop} shows strong demand with lower risk. This is the best expansion signal right now.`;
    }

    if (topPrediction.demand === "High") {
      return `${topPrediction.crop} shows the strongest demand, but manage timing carefully because risk is still present.`;
    }

    return "Current signals are mixed. Prefer cautious selling and avoid aggressive expansion.";
  }, [topPrediction]);

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#2563eb] rounded-full p-4 mb-4 shadow-sm">
          <BarChart3 size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("prediction") || "Crop Demand Prediction"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("prediction_desc") || "Future demand and market trends"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Top crop</p>
            <p className="mt-2 text-lg font-bold text-blue-900">{topPrediction?.crop ?? "No match"}</p>
            <p className="text-xs text-blue-700">{topPrediction?.targetMonth ?? "Adjust filters"}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">High demand</p>
            <p className="mt-2 text-lg font-bold text-emerald-900">{highDemandCount}</p>
            <p className="text-xs text-emerald-700">Filtered crops</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Avg. score</p>
            <p className="mt-2 text-lg font-bold text-violet-900">{averageScore}</p>
            <p className="text-xs text-violet-700">Demand score</p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-800">
            <Star className="h-4 w-4" />
            <span className="text-sm font-semibold">Best planning signal</span>
          </div>
          <p className="mt-2 text-sm text-blue-900">{planningMessage}</p>
          {topPrediction && (
            <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{topPrediction.crop}</p>
                  <p className="text-xs text-gray-500">{topPrediction.bestWindow}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                  {topPrediction.action}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Filter by crop</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cropOptions.map((crop) => (
                <Button
                  key={crop}
                  size="sm"
                  variant={selectedCrop === crop ? "default" : "outline"}
                  onClick={() => setSelectedCrop(crop)}
                >
                  {crop}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Filter by horizon</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {horizonOptions.map((horizon) => (
                <Button
                  key={horizon}
                  size="sm"
                  variant={selectedHorizon === horizon ? "default" : "outline"}
                  onClick={() => setSelectedHorizon(horizon)}
                >
                  {horizon}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Filter by demand level</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {demandOptions.map((demand) => (
                <Button
                  key={demand}
                  size="sm"
                  variant={selectedDemand === demand ? "default" : "outline"}
                  onClick={() => setSelectedDemand(demand)}
                >
                  {demand}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {topPrediction && lowestPrediction && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Best opportunity</p>
              <p className="mt-2 text-lg font-bold text-green-900">{topPrediction.crop}</p>
              <p className="text-xs text-green-700">{topPrediction.priceOutlook}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Highest caution</p>
              <p className="mt-2 text-lg font-bold text-red-900">{lowestPrediction.crop}</p>
              <p className="text-xs text-red-700">{lowestPrediction.priceOutlook}</p>
            </div>
          </div>
        )}

        {filteredPredictions.map((item) => (
          <div
            key={`${item.crop}-${item.targetMonth}`}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{item.crop}</h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 inline-block">
                    {item.targetMonth}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getRiskClasses(item.risk)}`}>
                    {item.risk} risk
                  </span>
                </div>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center ${
                  item.trend === "up"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {item.trend === "up" ? (
                  <TrendingUp size={16} className="mr-1.5" />
                ) : (
                  <TrendingDown size={16} className="mr-1.5" />
                )}
                <span className="font-bold">{item.demand} Demand</span>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Demand score</span>
                <span className="font-bold text-gray-900">{item.demandScore}/100</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div className={`h-2 rounded-full ${getDemandTone(item.demandScore)}`} style={{ width: `${item.demandScore}%` }} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Best window</span>
                </div>
                <p className="mt-1 font-bold text-gray-900">{item.bestWindow}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Suggested action</span>
                </div>
                <p className="mt-1 font-bold text-gray-900">{item.action}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <div className="flex items-center gap-2 text-indigo-800">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-sm font-semibold">Price outlook</span>
              </div>
              <p className="mt-1 text-sm text-indigo-900">{item.priceOutlook}</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start mt-3">
              <Info size={18} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-snug">{item.insight}</p>
            </div>

            <div className="mt-3 text-right">
              <span className="text-xs text-gray-400 font-medium">
                AI Confidence: {item.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
