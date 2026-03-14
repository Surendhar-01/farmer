"use client";

import { useLanguage } from "./LanguageProvider";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="relative inline-block text-left group">
        <button className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors">
          <Globe size={20} className="text-blue-500" />
          <span className="font-semibold uppercase">{language}</span>
        </button>

        {/* Dropdown Menu - appears on hover/focus */}
        <div className="absolute left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left">
          <div className="py-2">
            <button
              onClick={() => setLanguage("en")}
              className={`block w-full text-left px-4 py-2 text-sm ${language === "en" ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("ta")}
              className={`block w-full text-left px-4 py-2 text-sm ${language === "ta" ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`block w-full text-left px-4 py-2 text-sm ${language === "hi" ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
