"use client";

import React, { createContext, useContext, useState } from "react";
import en from "../../translations/en.json";
import ta from "../../translations/ta.json";
import hi from "../../translations/hi.json";

export type Language = "en" | "ta" | "hi";

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = { en, ta, hi };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  voiceExplainerEnabled: boolean;
  setVoiceExplainerEnabled: (enabled: boolean) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const saved = localStorage.getItem("farmassist_lang");
    return saved === "en" || saved === "ta" || saved === "hi" ? saved : "en";
  });
  const [voiceExplainerEnabled, setVoiceExplainerEnabled] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("farmassist_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, voiceExplainerEnabled, setVoiceExplainerEnabled, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
