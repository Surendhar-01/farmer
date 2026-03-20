"use client";

import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

export const useSpeechSynthesis = () => {
  const { language } = useLanguage();
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

  const speak = (textToSpeak?: string, rate = 1) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const text = textToSpeak || "";
    if (!text) return setIsSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = getVoiceCode();
    utterance.lang = targetLang;
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const voiceMatch = voices.find(
      (voice) =>
        voice.lang.startsWith(targetLang) || voice.lang.startsWith(targetLang.split("-")[0])
    );
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};
