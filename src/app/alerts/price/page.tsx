"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  BellRing,
  ArrowDownRight,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

type AlertRisk = "high" | "medium";

interface PriceAlert {
  crop: string;
  currentPrice: number;
  predictedPrice: number;
  dropPercent: number;
  date: string;
  risk: AlertRisk;
  recommendation: string;
}

const alerts: PriceAlert[] = [
  {
    crop: "Tomato",
    currentPrice: 15,
    predictedPrice: 8,
    dropPercent: 46,
    date: "Expected in 5 days",
    risk: "high",
    recommendation: "Sell immediately or stagger dispatch within 48 hours to reduce downside.",
  },
  {
    crop: "Onion",
    currentPrice: 40,
    predictedPrice: 35,
    dropPercent: 12,
    date: "Expected in 10 days",
    risk: "medium",
    recommendation: "Track arrivals daily and hold only if storage conditions are stable.",
  },
  {
    crop: "Potato",
    currentPrice: 28,
    predictedPrice: 22,
    dropPercent: 21,
    date: "Expected in 7 days",
    risk: "medium",
    recommendation: "Check cold storage cost before delaying sale for another week.",
  },
];

export default function PriceDropAlertsPage() {
  const { t } = useLanguage();
  const [selectedRisk, setSelectedRisk] = useState<"all" | AlertRisk>("all");

  const filteredAlerts = useMemo(() => {
    if (selectedRisk === "all") {
      return alerts;
    }

    return alerts.filter((item) => item.risk === selectedRisk);
  }, [selectedRisk]);

  const severeCount = alerts.filter((item) => item.risk === "high").length;
  const averageDrop = Math.round(
    alerts.reduce((total, item) => total + item.dropPercent, 0) / alerts.length
  );

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#dc2626] rounded-full p-4 mb-4 shadow-sm">
          <BellRing size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("price_drop_warning") || "Price Drop Warning"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("price_drop_desc") || "Early alerts for crash prices"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">High risk</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-900">{severeCount}</p>
            <p className="text-xs text-red-700">Require immediate selling decision</p>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-700">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Avg. drop</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-orange-900">{averageDrop}%</p>
            <p className="text-xs text-orange-700">Across all active alerts</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedRisk === "all" ? "default" : "outline"}
            onClick={() => setSelectedRisk("all")}
          >
            All Alerts
          </Button>
          <Button
            size="sm"
            variant={selectedRisk === "high" ? "default" : "outline"}
            onClick={() => setSelectedRisk("high")}
          >
            High Risk
          </Button>
          <Button
            size="sm"
            variant={selectedRisk === "medium" ? "default" : "outline"}
            onClick={() => setSelectedRisk("medium")}
          >
            Medium Risk
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start w-full shadow-sm mb-2">
          <span className="mr-3 text-xl">🔴</span>
          <p className="text-red-800 text-sm font-medium">
            Action required: {severeCount} crop alert{severeCount === 1 ? "" : "s"} could materially reduce your selling price this week.
          </p>
        </div>

        {filteredAlerts.map((item) => (
          <div
            key={item.crop}
            className="bg-red-50 rounded-2xl p-5 border-l-4 border-red-500 shadow-sm w-full hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute right-[-20px] top-[-20px] opacity-5">
              <ArrowDownRight size={120} />
            </div>

            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h2 className="font-bold text-red-900 text-xl">{item.crop}</h2>
                <div className="text-red-700 text-sm font-medium mt-1">{item.date}</div>
              </div>
              <div className="bg-white/80 px-3 py-1 rounded-lg border border-red-200">
                <span className="font-bold text-red-600">-{item.dropPercent}%</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm relative z-10">
              <div className="bg-white rounded-xl p-3 border border-red-100">
                <p className="text-gray-500 text-xs text-center mb-1">Current</p>
                <p className="font-bold text-gray-900 text-center">₹{item.currentPrice}/kg</p>
              </div>
              <div className="bg-red-600 text-white rounded-xl p-3 shadow-sm border border-red-600">
                <p className="text-red-100 text-xs text-center mb-1">Predicted</p>
                <p className="font-bold text-white text-center">₹{item.predictedPrice}/kg</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white p-4 border border-red-100">
              <p className="text-sm text-red-900 font-semibold flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Recommended response
              </p>
              <p className="mt-2 text-sm text-red-800">{item.recommendation}</p>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start w-full">
          <span className="mr-3 text-xl">🔵</span>
          <p className="text-blue-800 text-sm">
            Predictions are based on local mandi arrivals, crop supply pressure, and upcoming regional weather patterns.
          </p>
        </div>
      </div>
    </main>
  );
}
