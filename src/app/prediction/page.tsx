"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { BarChart3, TrendingUp, TrendingDown, Info } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function PredictionPage() {
  const { t } = useLanguage();

  const predictions = [
    {
      crop: "Tomato",
      targetMonth: "Next Month",
      demand: "High",
      trend: "up",
      confidence: "85%",
      insight: "Festive season approaches. Demand expected to exceed supply due to recent heavy rains in neighboring districts."
    },
    {
      crop: "Onion",
      targetMonth: "Next 2 Months",
      demand: "Low",
      trend: "down",
      confidence: "92%",
      insight: "Massive harvest expected across the state. Expect market oversupply and significantly dropping prices."
    }
  ];

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#2563eb] rounded-full p-4 mb-4 shadow-sm">
          <BarChart3 size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("prediction" as any) || "Crop Demand Prediction"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("prediction_desc" as any) || "Future demand and market trends"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        {predictions.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{item.crop}</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 mt-1 inline-block">
                  {item.targetMonth}
                </span>
              </div>
              
              <div className={`px-3 py-1.5 rounded-xl border flex items-center ${item.trend === 'up' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {item.trend === 'up' ? <TrendingUp size={16} className="mr-1.5" /> : <TrendingDown size={16} className="mr-1.5" />}
                <span className="font-bold">{item.demand} Demand</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start mt-2">
              <Info size={18} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-snug">
                {item.insight}
              </p>
            </div>
            
            <div className="mt-3 text-right">
              <span className="text-xs text-gray-400 font-medium">AI Confidence: {item.confidence}</span>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}
