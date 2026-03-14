"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export function BackButton() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBack = () => {
    // Basic history length check. Next.js router.back() goes back in browser history.
    // If length <= 2, meaning they landed directly on this page, go to Dashboard.
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="w-full flex justify-start pt-4 w-full max-w-sm mx-auto">
      <button 
        onClick={handleBack} 
        className="flex items-center text-gray-700 hover:text-green-700 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
      >
        <ArrowLeft size={18} className="mr-2" />
        <span className="font-bold">{t("back") || "Back"}</span>
      </button>
    </div>
  );
}
