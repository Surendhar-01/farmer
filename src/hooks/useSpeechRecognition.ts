"use client";

import { useState, useRef } from "react";
import { useLanguage } from "../components/LanguageProvider";
import { useRouter } from "next/navigation";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultLike[];
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface BrowserSpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export const useSpeechRecognition = (onResult?: (text: string) => void, disableNavigation: boolean = false) => {
  const { language } = useLanguage();
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const getLangCode = () => {
    switch (language) {
      case "ta": return "ta-IN";
      case "hi": return "hi-IN";
      default: return "en-IN";
    }
  };

  const handleVoiceNavigation = (transcript: string) => {
    const text = transcript.toLowerCase();
    
    // Voice Navigation Logic based on user commands
    if (text.includes("market") || text.includes("price") || text.includes("சந்தை") || text.includes("बाजार")) {
      router.push("/market");
    } else if (text.includes("harvest") || text.includes("அறுவடை") || text.includes("फसल")) {
      router.push("/harvest");
    } else if (text.includes("alert") || text.includes("warning") || text.includes("வீழ்ச்சி") || text.includes("गिरावट")) {
      router.push("/alerts/price");
    } else if (text.includes("transport") || text.includes("vehicle") || text.includes("வாகனம்") || text.includes("परिवहन")) {
      router.push("/transport");
    } else if (text.includes("sell") || text.includes("bulk") || text.includes("விற்க") || text.includes("बिक्री")) {
      router.push("/sell");
    } else if (text.includes("storage") || text.includes("cold") || text.includes("கிடங்கு") || text.includes("कोल्ड")) {
      router.push("/storage");
    } else if (text.includes("predict") || text.includes("demand") || text.includes("கணிப்பு") || text.includes("भविष्यवाणी")) {
      router.push("/prediction");
    } else if (text.includes("profit") || text.includes("calculate") || text.includes("லாப") || text.includes("लाभ")) {
      router.push("/calculator");
    } else if (text.includes("scheme") || text.includes("government") || text.includes("அரசு") || text.includes("योजना")) {
      router.push("/schemes");
    } else if (text.includes("weather") || text.includes("rain") || text.includes("வானிலை") || text.includes("मौसम")) {
      router.push("/alerts/weather");
    } else if (text.includes("disease") || text.includes("photo") || text.includes("நோய்") || text.includes("रोग")) {
      router.push("/disease");
    } else if (text.includes("home") || text.includes("dashboard") || text.includes("முகப்பு") || text.includes("डैशबोर्ड")) {
      router.push("/");
    }
  };

  const startListening = () => {
    const browserWindow = window as BrowserSpeechWindow;
    const SpeechRecognitionAPI =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = getLangCode();

    recognitionRef.current.onstart = () => setIsListening(true);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
      if (!disableNavigation) {
        handleVoiceNavigation(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return { startListening, stopListening, isListening };
};
