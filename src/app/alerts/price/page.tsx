"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { BellRing, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function PriceDropAlertsPage() {
  const { t } = useLanguage();

  const alerts = [
    {
      crop: "Tomato",
      currentPrice: "₹15/kg",
      predictedPrice: "₹8/kg",
      drop: "-46%",
      trend: "down",
      date: "Expected in 5 days",
    },
    {
      crop: "Onion",
      currentPrice: "₹40/kg",
      predictedPrice: "₹35/kg",
      drop: "-12%",
      trend: "down",
      date: "Expected in 10 days",
    }
  ];

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      {/* Page Header */}
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#dc2626] rounded-full p-4 mb-4 shadow-sm">
          <BellRing size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("price_drop_warning" as any) || "Price Drop Warning"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("price_drop_desc" as any) || "Early alerts for crash prices"}
        </p>
      </div>

      {/* Alert Cards */}
      <div className="w-full space-y-4 max-w-sm">
        {alerts.map((item, idx) => (
          <div key={idx} className="bg-red-50 rounded-2xl p-5 border-l-4 border-red-500 shadow-sm w-full hover:shadow-md transition-shadow relative overflow-hidden">
            
            {/* Background Icon */}
            <div className="absolute right-[-20px] top-[-20px] opacity-5">
              <ArrowDownRight size={120} />
            </div>

            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h2 className="font-bold text-red-900 text-xl">{item.crop}</h2>
                <div className="text-red-700 text-sm font-medium mt-1">
                  {item.date}
                </div>
              </div>
              <div className="bg-white/80 px-3 py-1 rounded-lg border border-red-200">
                <span className="font-bold text-red-600">{item.drop}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm relative z-10">
              <div className="bg-white rounded-xl p-3 border border-red-100">
                <p className="text-gray-500 text-xs text-center mb-1">Current</p>
                <p className="font-bold text-gray-900 text-center">{item.currentPrice}</p>
              </div>
              <div className="bg-red-600 text-white rounded-xl p-3 shadow-sm border border-red-600">
                <p className="text-red-100 text-xs text-center mb-1">Predicted</p>
                <p className="font-bold text-white text-center">{item.predictedPrice}</p>
              </div>
            </div>

            <div className="mt-4 w-full bg-red-100 p-3 rounded-xl border border-red-200">
              <p className="text-red-800 text-sm font-medium flex items-center justify-center">
                <span className="mr-2 text-lg">🔴</span> Sell immediately to avoid loss.
              </p>
            </div>

          </div>
        ))}
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start w-full">
          <span className="mr-3 text-xl">🔵</span>
          <p className="text-blue-800 text-sm">
            Predictions are based on local Mandi arrivals and upcoming regional weather patterns.
          </p>
        </div>
      </div>
    </main>
  );
}
