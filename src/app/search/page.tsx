"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { BottomNav } from "@/components/BottomNav";
import { VoiceExplainer } from "@/components/VoiceExplainer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <VoiceExplainer textKey="voice_search_explainer" />
      <BackButton />
      
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#2563eb] rounded-full p-4 mb-4 shadow-sm">
          <Search size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("search_crops") || "Search Crops"}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 py-6 text-lg rounded-2xl shadow-sm border-none bg-white font-medium" 
            placeholder="E.g., Tomato prices in market..." 
          />
        </div>

        {query && (
          <div className="space-y-4 mt-6">
             <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-blue-800">Market demand for {query} is high.</h3>
               <p className="text-gray-600 text-sm mt-1">Current trends show that {query} prices are rising by 10% in major markets.</p>
             </div>
             
             <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-blue-800">Government announces subsidy for {query} farmers</h3>
               <p className="text-gray-600 text-sm mt-1">Farmers growing {query} can now apply for a 20% subsidy on seeds and fertilizers.</p>
             </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
