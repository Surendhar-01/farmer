"use client";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Mic, MicOff } from "lucide-react";

export const VoiceNavigator = () => {
  const { startListening, stopListening, isListening } = useSpeechRecognition();

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`fixed bottom-24 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
        isListening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-blue-600 text-white"
      }`}
    >
      {isListening ? <MicOff size={32} /> : <Mic size={32} />}
    </button>
  );
};
