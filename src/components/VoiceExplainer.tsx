"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { RotateCcw, Square, Volume2, VolumeX } from "lucide-react";

type Language = "en" | "ta" | "hi";

const PAGE_EXPLANATIONS: Record<Language, Array<{ match: string; text: string }>> = {
  en: [
    { match: "/market", text: "This page shows nearby markets and factories for selling crops. You can search by place, filter by crop, and check the latest market information." },
    { match: "/storage", text: "This page shows cold storage units near different areas. You can search by district or area, review storage details, and book storage for your crops." },
    { match: "/transport", text: "This route optimization page helps you plan crop transport. You can enter start and destination locations, estimate cost, and explore shared transport options." },
    { match: "/disease", text: "This AI crop disease detection page lets you upload or capture a crop image. The AI analyzes the image, detects likely disease, and suggests the next action." },
    { match: "/alerts/price", text: "This page shows price drop alerts. It helps you identify risky crops early and decide whether to sell, store, or wait." },
    { match: "/alerts/weather", text: "This page shows weather alerts for your farming decisions. It explains the impact of weather and what steps to take to protect your crops." },
    { match: "/prediction", text: "This page shows crop demand predictions and market outlook. It helps you understand future demand trends and plan sales more confidently." },
    { match: "/schemes", text: "This page lists government schemes for farmers. You can search support options, subsidies, and benefits relevant to your location and crops." },
    { match: "/search", text: "This page helps you search crop demand, prices, and farming information. You can type a crop or market query and get quick guidance." },
    { match: "/sell", text: "This bulk selling page helps you prepare crop sale details. You can enter quantity and price information to estimate your selling value." },
    { match: "/chat", text: "This is the AI assistant page. You can ask farming questions by typing or voice, and the assistant responds in your selected language." },
    { match: "/login", text: "This login page helps you sign in and choose your language. After login, the app adapts the experience to your preferred language." },
    { match: "/", text: "This is the home page where you can access all key farming tools like market finder, cold storage, transport, disease detection, and alerts." },
  ],
  ta: [
    { match: "/market", text: "இந்த பக்கம் அருகிலுள்ள சந்தைகள் மற்றும் தொழிற்சாலைகளை காட்டுகிறது. நீங்கள் இடம் மூலம் தேடலாம், பயிர் மூலம் வடிகட்டலாம், மற்றும் சமீபத்திய சந்தை தகவலை பார்க்கலாம்." },
    { match: "/storage", text: "இந்த பக்கம் பல பகுதிகளில் உள்ள குளிர்சாதன கிடங்குகளை காட்டுகிறது. நீங்கள் மாவட்டம் அல்லது பகுதி மூலம் தேடலாம், விவரங்களை பார்க்கலாம், மற்றும் உங்கள் பயிருக்காக கிடங்கை முன்பதிவு செய்யலாம்." },
    { match: "/transport", text: "இந்த பாதை திட்டமிடும் பக்கம் உங்கள் பயிர் போக்குவரத்துக்கு உதவுகிறது. தொடக்க இடம் மற்றும் இலக்கை உள்ளிடலாம், செலவை கணிக்கலாம், மற்றும் பகிர்வு போக்குவரத்து வாய்ப்புகளை பார்க்கலாம்." },
    { match: "/disease", text: "இந்த AI நோய் கண்டறிதல் பக்கத்தில் உங்கள் பயிர் படத்தை பதிவேற்றலாம் அல்லது படம் எடுக்கலாம். AI நோயை கண்டறிந்து அடுத்த நடவடிக்கையை சொலும்." },
    { match: "/alerts/price", text: "இந்த பக்கம் விலை சரிவு எச்சரிக்கைகளை காட்டுகிறது. எந்த பயிரில் ஆபத்து உள்ளது என்பதை முன்கூட்டியே அறிந்து விற்கலாமா, சேமிக்கலாமா, காத்திருக்கலாமா என்பதை முடிவு செய்ய உதவுகிறது." },
    { match: "/alerts/weather", text: "இந்த பக்கம் வானிலை எச்சரிக்கைகளை காட்டுகிறது. வானிலை உங்கள் பயிரில் என்ன தாக்கம் செய்கிறது மற்றும் பாதுகாப்பு நடவடிக்கைகள் என்ன என்பதை விளக்குகிறது." },
    { match: "/prediction", text: "இந்த பக்கம் பயிர் தேவையின் முன்னறிவிப்பையும் சந்தை நிலவரத்தையும் காட்டுகிறது. எதிர்கால தேவை மற்றும் விற்பனை திட்டமிட உதவுகிறது." },
    { match: "/schemes", text: "இந்த பக்கம் விவசாயிகளுக்கான அரசு திட்டங்களை காட்டுகிறது. உங்கள் இடம் மற்றும் பயிர்களுக்கு பொருத்தமான உதவித்தொகைகள் மற்றும் நலன்களை தேடலாம்." },
    { match: "/search", text: "இந்த பக்கம் பயிர் தேவை, விலை, மற்றும் விவசாய தகவல்களை தேட உதவுகிறது. நீங்கள் பயிர் பெயர் அல்லது சந்தை கேள்வியை உள்ளிட்டு விரைவான தகவலை பெறலாம்." },
    { match: "/sell", text: "இந்த மொத்த விற்பனை பக்கம் உங்கள் பயிர் விற்பனை விவரங்களை தயார் செய்ய உதவுகிறது. அளவு மற்றும் விலை உள்ளிட்டால் விற்பனை மதிப்பை கணிக்கலாம்." },
    { match: "/chat", text: "இது AI உதவி பக்கம். நீங்கள் தட்டச்சு அல்லது குரல் மூலம் கேள்விகள் கேட்கலாம், மற்றும் உதவி உங்கள் தேர்ந்தெடுத்த மொழியில் பதிலளிக்கும்." },
    { match: "/login", text: "இது உள்நுழைவு பக்கம். இங்கு நீங்கள் உள்நுழைந்து உங்கள் விருப்ப மொழியை தேர்ந்தெடுக்கலாம்." },
    { match: "/", text: "இது முகப்பு பக்கம். இங்கிருந்து சந்தை, குளிர்சாதன கிடங்கு, போக்குவரத்து, நோய் கண்டறிதல், மற்றும் எச்சரிக்கை போன்ற முக்கிய வசதிகளை அணுகலாம்." },
  ],
  hi: [
    { match: "/market", text: "यह पेज पास के बाजार और फैक्ट्रियों को दिखाता है। आप स्थान के अनुसार खोज सकते हैं, फसल के अनुसार फ़िल्टर कर सकते हैं, और नवीनतम बाजार जानकारी देख सकते हैं।" },
    { match: "/storage", text: "यह पेज अलग-अलग क्षेत्रों में उपलब्ध कोल्ड स्टोरेज यूनिट दिखाता है। आप जिला या क्षेत्र के अनुसार खोज सकते हैं, विवरण देख सकते हैं, और अपनी फसल के लिए स्टोरेज बुक कर सकते हैं।" },
    { match: "/transport", text: "यह रूट ऑप्टिमाइजेशन पेज आपकी फसल के परिवहन में मदद करता है। आप शुरुआत और गंतव्य दर्ज कर सकते हैं, लागत का अनुमान लगा सकते हैं, और साझा परिवहन विकल्प देख सकते हैं।" },
    { match: "/disease", text: "यह एआई फसल रोग पहचान पेज है। आप फसल की तस्वीर अपलोड या कैप्चर कर सकते हैं, और एआई रोग पहचान कर आगे की सलाह देता है।" },
    { match: "/alerts/price", text: "यह पेज कीमत गिरने की चेतावनियाँ दिखाता है। इससे आप जोखिम वाली फसलों को जल्दी पहचान सकते हैं और बेचने, स्टोर करने, या रुकने का निर्णय ले सकते हैं।" },
    { match: "/alerts/weather", text: "यह पेज मौसम अलर्ट दिखाता है। यह बताता है कि मौसम आपकी फसल को कैसे प्रभावित करेगा और आपको क्या कदम उठाने चाहिए।" },
    { match: "/prediction", text: "यह पेज फसल मांग पूर्वानुमान और बाजार रुझान दिखाता है। इससे आप भविष्य की मांग समझकर बेहतर योजना बना सकते हैं।" },
    { match: "/schemes", text: "यह पेज किसानों के लिए सरकारी योजनाएँ दिखाता है। आप अपनी जगह और फसल के अनुसार सब्सिडी और सहायता विकल्प देख सकते हैं।" },
    { match: "/search", text: "यह पेज फसल मांग, कीमत, और कृषि जानकारी खोजने में मदद करता है। आप फसल या बाजार से जुड़ा प्रश्न टाइप कर सकते हैं।" },
    { match: "/sell", text: "यह थोक बिक्री पेज आपकी बिक्री जानकारी तैयार करने में मदद करता है। आप मात्रा और कीमत भरकर कुल बिक्री मूल्य समझ सकते हैं।" },
    { match: "/chat", text: "यह एआई सहायक पेज है। आप लिखकर या आवाज़ से सवाल पूछ सकते हैं, और सहायक आपकी चुनी हुई भाषा में जवाब देगा।" },
    { match: "/login", text: "यह लॉगिन पेज है। यहाँ आप साइन इन कर सकते हैं और अपनी पसंदीदा भाषा चुन सकते हैं।" },
    { match: "/", text: "यह होम पेज है जहाँ से आप बाजार, कोल्ड स्टोरेज, परिवहन, रोग पहचान, और अलर्ट जैसे सभी मुख्य फीचर खोल सकते हैं।" },
  ],
};

const UI_TEXT: Record<Language, { on: string; off: string; repeat: string; stop: string }> = {
  en: { on: "Voice ON", off: "Voice OFF", repeat: "Repeat", stop: "Stop" },
  ta: { on: "குரல் ஆன்", off: "குரல் ஆஃப்", repeat: "மீண்டும்", stop: "நிறுத்து" },
  hi: { on: "वॉइस ऑन", off: "वॉइस ऑफ", repeat: "दोहराएँ", stop: "रोकें" },
};

export const VoiceExplainer = () => {
  const pathname = usePathname();
  const { language, voiceExplainerEnabled, setVoiceExplainerEnabled } = useLanguage();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [rate] = useState(1);
  const lastSpokenRef = useRef("");

  const explanation = useMemo(() => {
    const matched =
      PAGE_EXPLANATIONS[language].find((entry) =>
        entry.match === "/" ? pathname === "/" : pathname.startsWith(entry.match)
      ) ?? PAGE_EXPLANATIONS[language][PAGE_EXPLANATIONS[language].length - 1];
    return matched.text;
  }, [language, pathname]);

  useEffect(() => {
    stop();
  }, [pathname, stop]);

  useEffect(() => {
    if (!voiceExplainerEnabled || !explanation) {
      return;
    }

    const pageKey = `${pathname}-${language}`;
    if (lastSpokenRef.current === pageKey) {
      return;
    }

    const timer = window.setTimeout(() => {
      speak(explanation, rate);
      lastSpokenRef.current = pageKey;
    }, 450);

    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [explanation, language, pathname, rate, speak, stop, voiceExplainerEnabled]);

  const labels = UI_TEXT[language];

  return (
    <div className="fixed bottom-24 left-4 z-50 flex items-center gap-2">
      <button
        onClick={() => {
          if (voiceExplainerEnabled) {
            stop();
            setVoiceExplainerEnabled(false);
            return;
          }

          lastSpokenRef.current = "";
          setVoiceExplainerEnabled(true);
        }}
        className={`rounded-full px-4 py-3 text-white shadow-2xl transition-all ${
          voiceExplainerEnabled ? "bg-green-600" : "bg-gray-600"
        }`}
        aria-label={voiceExplainerEnabled ? labels.on : labels.off}
      >
        <div className="flex items-center gap-2">
          {voiceExplainerEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span className="text-sm font-semibold">{voiceExplainerEnabled ? labels.on : labels.off}</span>
        </div>
      </button>

      {voiceExplainerEnabled && (
        <>
          <button
            onClick={() => speak(explanation, rate)}
            className="rounded-full bg-blue-600 p-3 text-white shadow-2xl"
            aria-label={labels.repeat}
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={stop}
            className={`rounded-full p-3 text-white shadow-2xl ${isSpeaking ? "bg-red-600" : "bg-slate-600"}`}
            aria-label={labels.stop}
          >
            <Square size={20} />
          </button>
        </>
      )}
    </div>
  );
};
