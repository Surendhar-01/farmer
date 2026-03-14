"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { BarChart3, TrendingUp, TrendingDown, Info } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

interface Prediction {
  crop: string;
  targetMonth: string;
  demand: "High" | "Moderate" | "Low";
  trend: "up" | "down";
  confidence: number;
  demandScore: number;
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
    insight: "Festive season approaches. Demand expected to exceed supply due to recent heavy rains in neighboring districts.",
  },
  {
    crop: "Onion",
    targetMonth: "Next 2 Months",
    demand: "Low",
    trend: "down",
    confidence: 92,
    demandScore: 34,
    insight: "Massive harvest expected across the state. Expect market oversupply and significantly dropping prices.",
  },
  {
    crop: "Potato",
    targetMonth: "Next Month",
    demand: "Moderate",
    trend: "up",
    confidence: 78,
    demandScore: 61,
    insight: "Steady urban demand may support prices if cold-storage losses stay low.",
  },
];

export default function PredictionPage() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedHorizon, setSelectedHorizon] = useState("All");

  const cropOptions = useMemo(() => ["All", ...new Set(predictions.map((item) => item.crop))], []);
  const horizonOptions = useMemo(
    () => ["All", ...new Set(predictions.map((item) => item.targetMonth))],
    []
  );

  const filteredPredictions = useMemo(() => {
    return predictions.filter((item) => {
      const cropMatch = selectedCrop === "All" || item.crop === selectedCrop;
      const horizonMatch = selectedHorizon === "All" || item.targetMonth === selectedHorizon;
      return cropMatch && horizonMatch;
    });
  }, [selectedCrop, selectedHorizon]);

  const topPrediction = filteredPredictions.reduce<Prediction | null>((best, current) => {
    if (!best || current.demandScore > best.demandScore) {
      return current;
    }

    return best;
  }, null);

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
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Best demand</p>
            <p className="mt-2 text-xl font-bold text-blue-900">{topPrediction?.crop ?? "No match"}</p>
            <p className="text-xs text-blue-700">{topPrediction?.targetMonth ?? "Adjust filters"}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Confidence</p>
            <p className="mt-2 text-xl font-bold text-emerald-900">
              {topPrediction ? `${topPrediction.confidence}%` : "--"}
            </p>
            <p className="text-xs text-emerald-700">Top filtered signal</p>
          </div>
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
        </div>

        {filteredPredictions.map((item) => (
          <div
            key={`${item.crop}-${item.targetMonth}`}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{item.crop}</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 mt-1 inline-block">
                  {item.targetMonth}
                </span>
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
                <div
                  className={`h-2 rounded-full ${
                    item.demandScore >= 70
                      ? "bg-green-500"
                      : item.demandScore >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${item.demandScore}%` }}
                />
              </div>
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
