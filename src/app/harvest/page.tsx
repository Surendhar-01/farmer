"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Sprout, CloudRain } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function HarvestRecommendationPage() {
  const { t } = useLanguage();

  const harvestData = [
    {
      crop: "Tomato",
      days: "90/90 days",
      weather: "Clear (Next 3 days)",
      status: "good",
      alert: "Ideal Window – Harvest Now",
      reason: "Peak price and clear weather."
    },
    {
      crop: "Onion",
      days: "100/120 days",
      weather: "Light Rain Expected",
      status: "wait",
      alert: "Growing – Wait to Harvest",
      reason: "Needs 20 more days for full size."
    },
    {
      crop: "Potato",
      days: "85/90 days",
      weather: "Heavy Storm Warning",
      status: "bad",
      alert: "Danger – Delay Harvesting",
      reason: "Impending rain will rot harvested crop."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-green-100 text-green-800 border-green-300";
      case "wait": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "bad": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "good": return "🟢";
      case "wait": return "🟡";
      case "bad": return "🔴";
      default: return "🔵";
    }
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      {/* Page Header */}
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#15803d] rounded-full p-4 mb-4 shadow-sm">
          <Sprout size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("harvest_recommendation" as any) || "Harvest Recommendation"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("harvest_desc" as any) || "AI advice on when to harvest"}
        </p>
      </div>

      {/* Harvest Cards */}
      <div className="w-full space-y-4 max-w-sm">
        {harvestData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow">
            
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

          </div>
        ))}
      </div>
    </main>
  );
}
