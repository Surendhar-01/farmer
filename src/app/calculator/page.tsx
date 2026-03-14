"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Calculator, IndianRupee, TrendingUp } from "lucide-react";
import { BackButton } from "@/components/BackButton";

interface ProfitSummary {
  revenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  breakEvenPrice: number;
  roi: number;
}

export default function ProfitCalculatorPage() {
  const { t } = useLanguage();
  const [result, setResult] = useState<ProfitSummary | null>(null);

  const calculateProfit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const yieldKg = Number(fd.get("yield"));
    const price = Number(fd.get("price"));
    const inputCost = Number(fd.get("cost"));
    const laborCost = Number(fd.get("labor"));
    const transportCost = Number(fd.get("transport"));

    const revenue = yieldKg * price;
    const totalCost = inputCost + laborCost + transportCost;
    const profit = revenue - totalCost;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const breakEvenPrice = yieldKg > 0 ? totalCost / yieldKg : 0;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    setResult({
      revenue,
      totalCost,
      profit,
      profitMargin,
      breakEvenPrice,
      roi,
    });
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#0891b2] rounded-full p-4 mb-4 shadow-sm">
          <Calculator size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("calculator") || "Profit Calculator"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("calculator_desc") || "Estimate your farming profits"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        {result !== null && (
          <div
            className={`rounded-2xl p-6 border shadow-sm ${
              result.profit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="text-center">
              <h2 className="font-bold text-gray-500 mb-1">Estimated Net Profit</h2>
              <p
                className={`text-4xl font-black ${
                  result.profit > 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                ₹{result.profit.toLocaleString()}
              </p>
              <button
                onClick={() => setResult(null)}
                className="mt-4 text-sm text-gray-500 underline"
              >
                Recalculate
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="mt-1 font-bold text-gray-900">₹{result.revenue.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="mt-1 font-bold text-gray-900">₹{result.totalCost.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Profit Margin</p>
                <p className="mt-1 font-bold text-gray-900">{result.profitMargin.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Break-even Price</p>
                <p className="mt-1 font-bold text-gray-900">₹{result.breakEvenPrice.toFixed(2)}/kg</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
              <div className="flex items-center gap-2 text-cyan-700">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">Return on investment</span>
              </div>
              <p className="mt-1 text-lg font-bold text-cyan-900">{result.roi.toFixed(1)}%</p>
            </div>
          </div>
        )}

        <div
          className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full ${
            result !== null ? "hidden" : "block"
          }`}
        >
          <form onSubmit={calculateProfit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Total Yield Available</label>
              <div className="relative">
                <input
                  name="yield"
                  type="number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  placeholder="e.g. 1000"
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400 font-medium">KG</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Expected Market Price</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input
                  name="price"
                  type="number"
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  placeholder="Price per KG"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Input Cost</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input
                  name="cost"
                  type="number"
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  placeholder="Seeds, fertilizer, irrigation"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Labor Cost</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input
                  name="labor"
                  type="number"
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  placeholder="Harvesting and daily labor"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Transport Cost</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input
                  name="transport"
                  type="number"
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  placeholder="Market delivery and loading"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0891b2] hover:bg-cyan-700 text-white rounded-xl font-bold text-lg shadow-sm transition-colors mt-2"
            >
              Calculate Options
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
