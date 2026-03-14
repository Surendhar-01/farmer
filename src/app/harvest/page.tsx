"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Sprout, CloudRain, CalendarDays, CheckCircle2 } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

type HarvestStatus = "good" | "wait" | "bad";

interface HarvestRecommendation {
  crop: string;
  days: string;
  weather: string;
  status: HarvestStatus;
  alert: string;
  reason: string;
  action: string;
  marketOutlook: string;
}

const harvestData: HarvestRecommendation[] = [
  {
    crop: "Tomato",
    days: "90/90 days",
    weather: "Clear (Next 3 days)",
    status: "good",
    alert: "Ideal Window - Harvest Now",
    reason: "Peak price and clear weather.",
    action: "Harvest in the next 24 hours and move produce to market early morning.",
    marketOutlook: "Strong short-term demand in nearby wholesale markets.",
  },
  {
    crop: "Onion",
    days: "100/120 days",
    weather: "Light Rain Expected",
    status: "wait",
    alert: "Growing - Wait to Harvest",
    reason: "Needs 20 more days for full size.",
    action: "Delay harvest and watch bulb maturity after rainfall passes.",
    marketOutlook: "Prices are stable, so waiting should not hurt margins yet.",
  },
  {
    crop: "Potato",
    days: "85/90 days",
    weather: "Heavy Storm Warning",
    status: "bad",
    alert: "Danger - Delay Harvesting",
    reason: "Impending rain will rot harvested crop.",
    action: "Avoid uprooting now. Protect field drainage and reassess after the storm.",
    marketOutlook: "Weather risk is currently more important than market timing.",
  },
];

export default function HarvestRecommendationPage() {
  const { t } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<"all" | HarvestStatus>("all");

  const filteredHarvestData = useMemo(() => {
    if (selectedStatus === "all") {
      return harvestData;
    }

    return harvestData.filter((item) => item.status === selectedStatus);
  }, [selectedStatus]);

  const readyCount = harvestData.filter((item) => item.status === "good").length;

  const getStatusColor = (status: HarvestStatus) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-300";
      case "wait":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "bad":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStatusDot = (status: HarvestStatus) => {
    switch (status) {
      case "good":
        return "🟢";
      case "wait":
        return "🟡";
      case "bad":
        return "🔴";
      default:
        return "🔵";
    }
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#15803d] rounded-full p-4 mb-4 shadow-sm">
          <Sprout size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("harvest_recommendation") || "Harvest Recommendation"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("harvest_desc") || "AI advice on when to harvest"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Ready now</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-900">{readyCount}</p>
            <p className="text-xs text-green-700">Crops within ideal harvest window</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Total tracked</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-900">{harvestData.length}</p>
            <p className="text-xs text-blue-700">Active crop recommendations</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedStatus === "all" ? "default" : "outline"}
            onClick={() => setSelectedStatus("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={selectedStatus === "good" ? "default" : "outline"}
            onClick={() => setSelectedStatus("good")}
          >
            Harvest Now
          </Button>
          <Button
            size="sm"
            variant={selectedStatus === "wait" ? "default" : "outline"}
            onClick={() => setSelectedStatus("wait")}
          >
            Wait
          </Button>
          <Button
            size="sm"
            variant={selectedStatus === "bad" ? "default" : "outline"}
            onClick={() => setSelectedStatus("bad")}
          >
            Risk
          </Button>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <h2 className="font-bold text-emerald-900">Harvest planning tip</h2>
          <p className="mt-2 text-sm text-emerald-800">
            Balance crop maturity, weather stability, and market timing. A good harvest window usually has at least two dry days and favorable prices.
          </p>
        </div>

        {filteredHarvestData.map((item) => (
          <div
            key={item.crop}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{item.crop}</h2>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <CloudRain size={14} className="mr-1" />
                  {item.weather}
                </div>
              </div>
              <div className="bg-gray-50 px-3 py-1 rounded-lg text-sm border border-gray-100">
                <span className="font-medium text-gray-700">Days: {item.days}</span>
              </div>
            </div>

            <div className={`mt-4 px-3 py-3 rounded-xl text-sm border ${getStatusColor(item.status)}`}>
              <div className="flex items-center font-bold mb-1">
                <span className="mr-2 text-lg">{getStatusDot(item.status)}</span>
                {item.alert}
              </div>
              <p className="opacity-90 ml-8 text-[13px]">{item.reason}</p>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Recommended action:</span> {item.action}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Market outlook:</span> {item.marketOutlook}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
