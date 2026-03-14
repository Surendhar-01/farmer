"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Camera, Image as ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";

export default function DiseaseDetectionPage() {
  const { t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setResult({
          disease: "Tomato Early Blight",
          confidence: "94%",
          severity: "Medium",
          treatment: "Apply Copper Fungicide immediately. Remove infected lower leaves."
        });
      }, 2500);
    }
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#d97706] rounded-full p-4 mb-4 shadow-sm">
          <Camera size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("upload_crop_photo" as any) || "Disease Detection"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("builds_buyer_trust" as any) || "Upload photo to diagnose"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        
        {!result && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
            <label 
              className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer ${analyzing ? 'border-amber-400 bg-amber-50 pointer-events-none' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
            >
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={analyzing}
              />
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mb-3"></div>
                  <span className="text-amber-700 font-bold">Analyzing image with AI...</span>
                </>
              ) : (
                <>
                  <Camera size={40} className="text-amber-600 mb-3" />
                  <span className="text-gray-700 font-bold text-lg mb-1">Open Camera</span>
                  <span className="text-gray-400 text-sm">Take a photo of the crop</span>
                </>
              )}
            </label>
            {!analyzing && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start">
                <span className="mr-2 text-lg mt-0.5">🔵</span>
                <p className="text-sm text-blue-800">For best accuracy, ensure the affected leaf is clearly visible and well-lit.</p>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full animate-in fade-in zoom-in duration-300">
             
             <div className="bg-amber-50 border-b border-amber-100 p-5 flex items-start">
               <AlertTriangle size={24} className="text-amber-600 mr-3 mt-1 flex-shrink-0" />
               <div>
                 <h2 className="font-bold text-amber-900 text-xl">{result.disease}</h2>
                 <p className="text-amber-700 text-sm mt-1">Severity: <span className="font-bold">{result.severity}</span> (AI Confidence: {result.confidence})</p>
               </div>
             </div>

             <div className="p-5">
               <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                 <CheckCircle2 size={18} className="text-green-500 mr-2" /> 
                 Recommended Treatment
               </h3>
               <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                 {result.treatment}
               </p>

               <button onClick={() => setResult(null)} className="mt-5 w-full py-3 bg-[#d97706] hover:bg-amber-700 text-white rounded-xl font-bold transition-colors">
                 Scan Another Crop
               </button>
             </div>

          </div>
        )}

      </div>
    </main>
  );
}
