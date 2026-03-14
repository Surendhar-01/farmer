"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

export const useSpeechSynthesis = (textKey?: string) => {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getVoiceCode = () => {
    switch (language) {
      case "ta":
        return "ta-IN";
      case "hi":
        return "hi-IN";
      default:
        return "en-IN";
    }
  };

  const speak = (textToSpeak?: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const text = textToSpeak || (textKey ? t(textKey) : "");
    if (!text) return setIsSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = getVoiceCode();
    utterance.lang = targetLang;

    // Fix for Chrome/Android explicitly requiring a voice match
    const voices = window.speechSynthesis.getVoices();
    const voiceMatch = voices.find(v => v.lang.startsWith(targetLang) || v.lang.startsWith(targetLang.split("-")[0]));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speak automatically on mount if textKey is provided
  useEffect(() => {
    if (textKey) {
      const timer = setTimeout(() => {
        speak(t(textKey));
      }, 500); // Small delay to let page load
      return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textKey, language]);

  const stop = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};
