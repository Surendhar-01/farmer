"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { CloudRain, CloudLightning, Wind } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function WeatherAlertsPage() {
  const { t } = useLanguage();

  const weatherAlerts = [
    {
      title: "Heavy Rainfall Warning",
      time: "Tomorrow, 2:00 PM",
      severity: "high",
      impact: "Do not harvest tomatoes or onions. Ensure drainage channels are clear.",
      icon: <CloudLightning size={24} />
    },
    {
      title: "High Winds",
      time: "Thursday, Evening",
      severity: "medium",
      impact: "Secure polyhouses. Minor impact on ground crops.",
      icon: <Wind size={24} />
    }
  ];

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#0ea5e9] rounded-full p-4 mb-4 shadow-sm">
          <CloudRain size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("check_alerts" as any) || "Weather Alerts"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("ai_harvesting_signal" as any) || "Impact of weather on your crops"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start w-full shadow-sm mb-2">
          <span className="mr-3 text-xl">🔴</span>
          <p className="text-red-800 text-sm font-medium">
            Action required: 1 severe weather event detected in your region.
          </p>
        </div>

        {weatherAlerts.map((item, idx) => (
          <div key={idx} className={`rounded-2xl p-5 shadow-sm border w-full ${item.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${item.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {item.icon}
                </div>
                <div>
                  <h2 className={`font-bold text-lg ${item.severity === 'high' ? 'text-orange-900' : 'text-gray-900'}`}>{item.title}</h2>
                  <div className="text-gray-500 text-sm mt-0.5">
                    {item.time}
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-3 px-3 py-3 rounded-xl border flex items-start ${item.severity === 'high' ? 'bg-white border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
              <span className="mr-2 text-lg">🔵</span>
              <p className={`text-sm ${item.severity === 'high' ? 'text-orange-800' : 'text-blue-800'}`}>{item.impact}</p>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}
