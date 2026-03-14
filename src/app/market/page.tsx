"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { TrendingUp, MapPin } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function MarketPricePage() {
  const { t } = useLanguage();

  const marketData = [
    {
      crop: "Tomato",
      market: "Trichy Market",
      price: "₹50/kg",
      distance: "40 km",
      status: "good",
      alert: "Good Price – Sell Now"
    },
    {
      crop: "Onion",
      market: "Chennai Wholesale",
      price: "₹30/kg",
      distance: "320 km",
      status: "wait",
      alert: "Price Stable – Wait"
    },
    {
      crop: "Potato",
      market: "Local Village Mandi",
      price: "₹18/kg",
      distance: "5 km",
      status: "bad",
      alert: "Price Falling – Delay Selling"
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
        <div className="bg-[#16a34a] rounded-full p-4 mb-4 shadow-sm">
          <TrendingUp size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("market_price_viewer" as any) || "Market Price Viewer"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("market_price_desc" as any) || "Check current crop prices"}
        </p>
      </div>

      {/* Market Cards */}
      <div className="w-full space-y-4 max-w-sm">
        {marketData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{item.crop}</h2>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin size={14} className="mr-1" />
                  {item.market} ({item.distance})
                </div>
              </div>
              <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">{item.price}</span>
              </div>
            </div>

            <div className={`mt-4 px-3 py-2 rounded-xl text-sm font-medium border flex items-center ${getStatusColor(item.status)}`}>
              <span className="mr-2 text-lg">{getStatusDot(item.status)}</span>
              {item.alert}
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}
