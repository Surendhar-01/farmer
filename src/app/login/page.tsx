"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sprout, Globe } from "lucide-react";

export default function LoginPage() {
  const { t, setLanguage, language } = useLanguage();
  const router = useRouter();
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "language">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    
    // For demo purposes and actual phone numbers in dev, use mock or ensure +countrycode
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
      }
    } catch {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        setError(error.message);
      } else {
        // Success! Instead of router.push, show language
        setStep("language");
      }
    } catch {
      setError("Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLogin = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-xl flex flex-col items-center">
        {step === "language" ? <Globe className="text-blue-600 mb-4" size={64} /> : <Sprout className="text-green-600 mb-4" size={64} />}
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {step === "language" ? t("select_language") || "Select Language" : t("login_title")}
        </h1>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {step === "phone" && (
          <div className="w-full space-y-4">
            <Input
              type="tel"
              placeholder={t("phone_number")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="py-6 text-xl text-center shadow-inner"
            />
            <Button
              className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 rounded-xl"
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10}
            >
              {loading ? "..." : t("send_otp")}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="w-full space-y-4">
            <Input
              type="text"
              placeholder={t("enter_otp")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="py-6 text-xl tracking-widest text-center shadow-inner font-bold"
              maxLength={6}
            />
            <Button
              className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 rounded-xl"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
            >
              {loading ? "..." : t("verify_otp")}
            </Button>
          </div>
        )}

        {step === "language" && (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={language === "en" ? "default" : "outline"}
                className={`py-8 text-xl rounded-2xl ${language === "en" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
              <Button
                variant={language === "ta" ? "default" : "outline"}
                className={`py-8 text-xl rounded-2xl ${language === "ta" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                onClick={() => setLanguage("ta")}
              >
                தமிழ் (Tamil)
              </Button>
              <Button
                variant={language === "hi" ? "default" : "outline"}
                className={`py-8 text-xl rounded-2xl ${language === "hi" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                onClick={() => setLanguage("hi")}
              >
                हिन्दी (Hindi)
              </Button>
            </div>
            
            <Button
              className="w-full py-6 mt-6 text-lg bg-green-600 hover:bg-green-700 rounded-xl"
              onClick={handleCompleteLogin}
            >
              {t("continue") || "Continue"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
