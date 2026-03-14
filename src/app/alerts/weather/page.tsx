"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  AlertTriangle,
  CloudLightning,
  CloudRain,
  Droplets,
  ShieldCheck,
  Wind,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

type AlertSeverity = "high" | "medium" | "low";

interface WeatherAlert {
  title: string;
  time: string;
  severity: AlertSeverity;
  impact: string;
  action: string;
  icon: React.ReactNode;
}

const weatherAlerts: WeatherAlert[] = [
  {
    title: "Heavy Rainfall Warning",
    time: "Tomorrow, 2:00 PM",
    severity: "high",
    impact: "Do not harvest tomatoes or onions. Ensure drainage channels are clear.",
    action: "Move harvested produce under cover and clear field drainage before rainfall.",
    icon: <CloudLightning size={24} />,
  },
  {
    title: "High Winds",
    time: "Thursday, Evening",
    severity: "medium",
    impact: "Secure polyhouses. Minor impact on ground crops.",
    action: "Tie support poles, check nets, and avoid pesticide spraying during gusts.",
    icon: <Wind size={24} />,
  },
  {
    title: "Moisture Build-Up",
    time: "Next 24 Hours",
    severity: "low",
    impact: "Higher humidity may increase fungal risk in stored vegetables.",
    action: "Improve ventilation in storage and inspect crops for early disease spots.",
    icon: <Droplets size={24} />,
  },
];

export default function WeatherAlertsPage() {
  const { t } = useLanguage();
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | AlertSeverity>("all");

  const filteredAlerts = useMemo(() => {
    if (selectedSeverity === "all") {
      return weatherAlerts;
    }

    return weatherAlerts.filter((alert) => alert.severity === selectedSeverity);
  }, [selectedSeverity]);

  const severeCount = weatherAlerts.filter((alert) => alert.severity === "high").length;

  const readinessSteps = [
    "Check drainage channels and bunds.",
    "Shift harvested crops to covered storage.",
    "Pause spraying before strong wind or heavy rain.",
  ];

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#0ea5e9] rounded-full p-4 mb-4 shadow-sm">
          <CloudRain size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("check_alerts") || "Weather Alerts"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("ai_harvesting_signal") || "Impact of weather on your crops"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Severe</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-900">{severeCount}</p>
            <p className="text-xs text-red-700">Require immediate action</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Preparedness</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-900">3</p>
            <p className="text-xs text-emerald-700">Recommended field checks</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start w-full shadow-sm mb-2">
          <span className="mr-3 text-xl">🔴</span>
          <p className="text-red-800 text-sm font-medium">
            Action required: {severeCount} severe weather event{severeCount === 1 ? "" : "s"} detected in your region.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedSeverity === "all" ? "default" : "outline"}
            onClick={() => setSelectedSeverity("all")}
          >
            All Alerts
          </Button>
          <Button
            size="sm"
            variant={selectedSeverity === "high" ? "default" : "outline"}
            onClick={() => setSelectedSeverity("high")}
          >
            High
          </Button>
          <Button
            size="sm"
            variant={selectedSeverity === "medium" ? "default" : "outline"}
            onClick={() => setSelectedSeverity("medium")}
          >
            Medium
          </Button>
          <Button
            size="sm"
            variant={selectedSeverity === "low" ? "default" : "outline"}
            onClick={() => setSelectedSeverity("low")}
          >
            Low
          </Button>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <h2 className="font-bold text-blue-900">Readiness checklist</h2>
          <div className="mt-3 space-y-2">
            {readinessSteps.map((step) => (
              <div key={step} className="flex items-start gap-2 text-sm text-blue-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {filteredAlerts.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
            className={`rounded-2xl p-5 shadow-sm border w-full ${
              item.severity === "high"
                ? "bg-orange-50 border-orange-200"
                : item.severity === "medium"
                  ? "bg-white border-gray-100"
                  : "bg-emerald-50 border-emerald-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 ${
                    item.severity === "high"
                      ? "bg-orange-500 text-white"
                      : item.severity === "medium"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <h2
                    className={`font-bold text-lg ${
                      item.severity === "high"
                        ? "text-orange-900"
                        : item.severity === "medium"
                          ? "text-gray-900"
                          : "text-emerald-900"
                    }`}
                  >
                    {item.title}
                  </h2>
                  <div className="text-gray-500 text-sm mt-0.5">{item.time}</div>
                </div>
              </div>
            </div>

            <div
              className={`mt-3 px-3 py-3 rounded-xl border flex items-start ${
                item.severity === "high"
                  ? "bg-white border-orange-100"
                  : item.severity === "medium"
                    ? "bg-blue-50 border-blue-100"
                    : "bg-white border-emerald-100"
              }`}
            >
              <span className="mr-2 text-lg">🔵</span>
              <p
                className={`text-sm ${
                  item.severity === "high"
                    ? "text-orange-800"
                    : item.severity === "medium"
                      ? "text-blue-800"
                      : "text-emerald-800"
                }`}
              >
                {item.impact}
              </p>
            </div>

            <div className="mt-3 rounded-xl bg-white/80 p-3 text-sm text-gray-700">
              <span className="font-semibold">Recommended action:</span> {item.action}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
