"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { VoiceExplainer } from "@/components/VoiceExplainer";
import { 
  Leaf, 
  Truck, 
  Store, 
  Camera, 
  CloudRain, 
  TrendingUp, 
  Sprout, 
  BellRing, 
  ShoppingCart, 
  BarChart3, 
  Calculator,
  Landmark,
  Mic
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      href: "/market",
      icon: <TrendingUp size={24} className="text-white" />,
      title: t("market_price_viewer") || "Markets and Factories Nearby",
      desc: t("market_price_desc") || "Find markets and factories nearby",
      color: "bg-[#16a34a]"
    },
    {
      href: "/harvest",
      icon: <Sprout size={24} className="text-white" />,
      title: t("harvest_recommendation") || "Harvest Recommendation",
      desc: t("harvest_desc") || "AI advice on when to harvest",
      color: "bg-[#15803d]"
    },
    {
      href: "/alerts/price",
      icon: <BellRing size={24} className="text-white" />,
      title: t("price_drop_warning") || "Price Drop Warning",
      desc: t("price_drop_desc") || "Early alerts for crash prices",
      color: "bg-[#dc2626]"
    },
    {
      href: "/transport",
      icon: <Truck size={24} className="text-white" />,
      title: t("shared_transport") || "Shared Transport",
      desc: t("transport_desc") || "Coordinate and lower costs",
      color: "bg-[#15803d]"
    },
    {
      href: "/sell",
      icon: <ShoppingCart size={24} className="text-white" />,
      title: t("bulk_selling") || "Bulk Selling",
      desc: t("bulk_desc") || "Sell your crops directly in bulk",
      color: "bg-[#ea580c]"
    },
    {
      href: "/storage",
      icon: <Store size={24} className="text-white" />,
      title: t("cold_storage") || "Cold Storage Locator",
      desc: t("storage_desc") || "Find and book nearby storage",
      color: "bg-[#15803d]"
    },
    {
      href: "/prediction",
      icon: <BarChart3 size={24} className="text-white" />,
      title: t("prediction") || "Crop Demand Prediction",
      desc: t("prediction_desc") || "Future demand and market trends",
      color: "bg-[#2563eb]"
    },
    {
      href: "/calculator",
      icon: <Calculator size={24} className="text-white" />,
      title: t("calculator") || "Profit Calculator",
      desc: t("calculator_desc") || "Estimate your farming profits",
      color: "bg-[#0891b2]"
    },
    {
      href: "/schemes",
      icon: <Landmark size={24} className="text-white" />,
      title: t("schemes") || "Government Schemes",
      desc: t("schemes_desc") || "Find agricultural subsidies",
      color: "bg-[#4f46e5]"
    },
    {
      href: "/alerts/weather",
      icon: <CloudRain size={24} className="text-white" />,
      title: t("check_alerts") || "Weather Alerts",
      desc: t("ai_harvesting_signal") || "Impact of weather on your crops",
      color: "bg-[#0ea5e9]"
    },
    {
      href: "/disease",
      icon: <Camera size={24} className="text-white" />,
      title: t("upload_crop_photo") || "Disease Detection",
      desc: t("builds_buyer_trust") || "Upload photo to diagnose",
      color: "bg-[#d97706]"
    },
    {
      href: "/chat",
      icon: <Mic size={24} className="text-white" />,
      title: t("voice_assistant") || "Voice Assistant",
      desc: t("voice_desc") || "Chat and listen in your language",
      color: "bg-[#15803d]"
    }
  ];

  return (
    <main className="w-full flex flex-col items-center pb-24">
      <VoiceExplainer textKey="voice_dashboard_explainer" />

      {/* Top Welcome Title Area */}
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center px-4 w-full">
        <div className="bg-[#15803d] rounded-full p-4 mb-4 shadow-sm">
          <Leaf size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("app_name") || "Agri Orbit"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("welcome_farmer") || "Welcome, Farmer!"}
        </p>
      </div>

      {/* Main Navigation Action Cards - Vertical Scrolling List */}
      <div className="w-full px-4 space-y-4 max-w-sm">
        {features.map((feature, idx) => (
          <Link key={idx} href={feature.href} className="block w-full">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className={`${feature.color} p-3 rounded-xl mr-4 flex-shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-[17px] leading-tight mb-1">{feature.title}</h2>
                <p className="text-gray-500 text-[13px]">{feature.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
