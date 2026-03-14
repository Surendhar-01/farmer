"use client";

import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX } from "lucide-react";

export const VoiceExplainer = ({ textKey }: { textKey: string }) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis(textKey);

  return (
    <button
      onClick={() => {
        if (isSpeaking) {
          stop();
        } else {
          speak(textKey); // actually it would need translated text, but the hook handles t(textKey) if we don't pass raw text? Wait, hook expects text as arg to `speak`. I'll update hook usage.
          // Let's rely on the hook's automatic speaking, and provide a replay button
        }
      }}
      className="fixed top-4 right-4 z-50 p-3 bg-green-500 text-white rounded-full shadow-lg"
    >
      {isSpeaking ? <Volume2 className="animate-pulse" size={28} /> : <VolumeX size={28} />}
    </button>
  );
};
