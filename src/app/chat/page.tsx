"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { BackButton } from "@/components/BackButton";
import { Send, Mic, Volume2, Bot, User } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function ChatPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { speak } = useSpeechSynthesis();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    let greeting = "Hello! I am your FarmAssist AI. How can I help you today?";
    if (language === "ta") greeting = "வணக்கம்! நான் உங்கள் உழவன் உதவி AI. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?";
    if (language === "hi") greeting = "नमस्ते! मैं आपका फार्मअसिस्ट एआई हूं। आज मैं आपकी कैसे मदद कर सकता हूं?";
    
    setMessages([{ id: Date.now().toString(), sender: "ai", text: greeting }]);
  }, [language]);

  // Handle Voice Input
  const { startListening, stopListening, isListening } = useSpeechRecognition((transcript) => {
    handleSend(transcript);
  }, true);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = (userText: string) => {
    const query = userText.toLowerCase();
    
    // Simple Local AI Logic Dictionary
    if (language === "ta") {
      if (query.includes("சந்தை") || query.includes("விலை")) return "தக்காளி, வெங்காயம் போன்ற பயிர்களின் நேரடி சந்தை விலைகளை அறிய முகப்பு பக்கத்தில் உள்ள 'சந்தை விலை' என்ற தேர்வை பயன்படுத்தவும்.";
      if (query.includes("அறுவடை")) return "தட்பவெப்ப நிலை மற்றும் சந்தை விலையின் அடிப்படையில் உங்கள் பயிரை அறுவடை செய்யலாமா என்று அறிய 'அறுவடை ஆலோசனை' பகுதியை பார்க்கவும்.";
      if (query.includes("போக்குவரத்து") || query.includes("வாகனம்")) return "மற்ற விவசாயிகளுடன் இணைந்து பயணச்சீட்டு செலவை பகிர 'பொது போக்குவரத்து' என்ற பகுதியை பயன்படுத்தலாம்.";
      if (query.includes("நோய்")) return "உங்கள் பயிரில் உள்ள நோயை கண்டுபிடிக்க 'நோய் கண்டறிதல்' பகுதியில் புகைப்படம் பதிவேற்றவும்.";
      return "மன்னிக்கவும், எனக்கு புரியவில்லை. சந்தை அல்லது ஆப் பயன்கள் பற்றி நீங்கள் கேட்கலாம்.";
    } 
    else if (language === "hi") {
      if (query.includes("बाजार") || query.includes("कीमत")) return "टमाटर, प्याज जैसी फसलों की लाइव बाजार कीमत जानने के लिए डैशबोर्ड पर 'बाजार मूल्य' का उपयोग करें।";
      if (query.includes("फसल") || query.includes("काटने")) return "मौसम और कीमतों के आधार पर अपनी फसल काटने के लिए 'फसल सलाह' अनुभाग देखें।";
      if (query.includes("परिवहन") || query.includes("वाहन")) return "अन्य किसानों के साथ परिवहन लागत साझा करने के लिए 'साझा परिवहन' पृष्ठ का उपयोग करें।";
      if (query.includes("रोग") || query.includes("बीमारी")) return "अपनी फसल की बीमारी का पता लगाने के लिए 'रोग पहचान' पृष्ठ पर फोटो अपलोड करें।";
      return "क्षमा करें, मुझे समझ नहीं आया। आप ऐप के कामकाज या बाजार से संबंधित प्रश्न पूछ सकते हैं।";
    }
    // Default English
    if (query.includes("market") || query.includes("price")) return "You can check live crop prices by visiting the 'Market Prices' option on the dashboard. Prices are updated daily.";
    if (query.includes("harvest")) return "To know whether it is the right time to harvest, visit the 'Harvest Advice' feature. It uses weather and price data to guide you.";
    if (query.includes("transport") || query.includes("vehicle")) return "You can share a truck with other farmers and split the cost by using the 'Shared Transport' feature.";
    if (query.includes("disease") || query.includes("photo")) return "If your crop is sick, take a photo in the 'Disease Detection' section and the AI will tell you the treatment.";
    if (query.includes("scheme") || query.includes("government")) return "You can find all subsidies in the 'Government Schemes' section on the dashboard.";
    
    return "I am a simple FarmAssist AI. You can ask me how to use this app, check market prices, find transport, or analyze crop diseases!";
  };

  const handleSend = (textOverride?: string) => {
    const textToProcess = textOverride || input;
    if (!textToProcess.trim()) return;

    // Add user message
    const newMessages = [...messages, { id: Date.now().toString(), sender: "user" as const, text: textToProcess }];
    setMessages(newMessages);
    setInput("");

    // Generate AI response
    setTimeout(() => {
      const reply = generateAIResponse(textToProcess);
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), sender: "ai" as const, text: reply }]);
      // Auto-read response if user used voice to ask
      if (textOverride) {
        speak(reply);
      }
    }, 600);
  };

  return (
    <main className="w-full flex flex-col h-screen bg-gray-50">
      <div className="px-4 py-2 shrink-0 bg-white shadow-sm flex items-center h-[70px]">
        <BackButton />
        <div className="ml-4 flex items-center">
          <Bot size={24} className="text-green-600 mr-2 mt-4" />
          <h1 className="text-lg font-bold text-gray-900 mt-4">FarmAssist AI</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} w-full`}>
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 shrink-0">
                <Bot size={16} className="text-green-700" />
              </div>
            )}
            
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm relative ${msg.sender === "user" ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"}`}>
              <p className="text-[15px] leading-relaxed mb-4">{msg.text}</p>
              
              {msg.sender === "ai" && (
                <button 
                  onClick={() => speak(msg.text)}
                  className="absolute bottom-1 right-1 p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  aria-label="Play message"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2 shrink-0">
                <User size={16} className="text-blue-700" />
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-white px-4 py-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-10">
        <div className="flex items-center space-x-2 max-w-sm mx-auto">
          <button 
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-full flex-shrink-0 transition-colors shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          >
            <Mic size={22} />
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={language === "ta" ? "உங்கள் கேள்வியை தட்டச்சு செய்யவும்..." : language === "hi" ? "अपना प्रश्न टाइप करें..." : "Type your question..."}
            className="flex-1 border border-gray-200 rounded-full px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm"
          />
          
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-green-600 text-white rounded-full flex-shrink-0 disabled:opacity-50 disabled:bg-gray-400 shadow-sm"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </main>
  );
}
