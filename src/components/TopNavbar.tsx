"use client";

import { useLanguage } from "./LanguageProvider";
import { Globe, Leaf, ChevronDown } from "lucide-react";
import Link from "next/link";

export const TopNavbar = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#15803d] text-white shadow-md">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <Leaf size={24} className="text-white" />
          <span className="font-bold text-lg tracking-wide">FarmAssist</span>
        </Link>

        {/* Language Switcher Dropdown inside Navbar */}
        <div className="relative inline-block text-left group">
          <button className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-md border border-white/20 text-sm">
            <Globe size={16} />
            <span className="font-medium mr-1 uppercase">
              {language === "ta" ? "தமிழ்" : language === "hi" ? "हिन्दी" : "English"}
            </span>
            <ChevronDown size={14} />
          </button>

          {/* Dropdown Menu - appears on hover/focus */}
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
            <div className="py-2">
              <button
                onClick={() => setLanguage("en")}
                className={`block w-full text-left px-4 py-2 text-sm ${language === "en" ? "bg-green-50 text-green-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("ta")}
                className={`block w-full text-left px-4 py-2 text-sm ${language === "ta" ? "bg-green-50 text-green-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`block w-full text-left px-4 py-2 text-sm ${language === "hi" ? "bg-green-50 text-green-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
