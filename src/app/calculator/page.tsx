"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Calculator, IndianRupee } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";

export default function ProfitCalculatorPage() {
  const { t } = useLanguage();
  const [result, setResult] = useState<null | number>(null);

  const calculateProfit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const yieldKg = Number(fd.get("yield"));
    const price = Number(fd.get("price"));
    const cost = Number(fd.get("cost"));
    
    setResult((yieldKg * price) - cost);
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#0891b2] rounded-full p-4 mb-4 shadow-sm">
          <Calculator size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("calculator" as any) || "Profit Calculator"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("calculator_desc" as any) || "Estimate your farming profits"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        
        {result !== null && (
          <div className={`${result > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-2xl p-6 border text-center shadow-sm`}>
             <h2 className="font-bold text-gray-500 mb-1">Estimated Net Profit</h2>
             <p className={`text-4xl font-black ${result > 0 ? 'text-green-700' : 'text-red-700'}`}>
               ₹{result.toLocaleString()}
             </p>
             <button onClick={() => setResult(null)} className="mt-4 text-sm text-gray-500 underline">Recalculate</button>
          </div>
        )}

        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full ${result !== null ? 'hidden' : 'block'}`}>
          <form onSubmit={calculateProfit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Total Yield Available</label>
              <div className="relative">
                <input name="yield" type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900" placeholder="e.g. 1000" required />
                <span className="absolute right-4 top-3 text-gray-400 font-medium">KG</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Expected Market Price</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input name="price" type="number" className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900" placeholder="Price per KG" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Total Input Costs</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input name="cost" type="number" className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900" placeholder="Seeds, Fertilizer, Transport" required />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-[#0891b2] hover:bg-cyan-700 text-white rounded-xl font-bold text-lg shadow-sm transition-colors mt-2">
              Calculate Options
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
