"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { ShoppingCart, Upload, IndianRupee } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";

export default function BulkSellingPage() {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#ea580c] rounded-full p-4 mb-4 shadow-sm">
          <ShoppingCart size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("bulk_selling" as any) || "Bulk Selling"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("bulk_desc" as any) || "Sell your crops directly in bulk"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        {success ? (
          <div className="bg-green-50 rounded-2xl p-8 border border-green-200 text-center shadow-sm">
             <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-white text-3xl">✓</span>
             </div>
             <h2 className="font-bold text-xl text-green-900 mb-2">Listing Posted!</h2>
             <p className="text-green-700 text-sm">Buyers in your region have been notified. You will receive SMS alerts for incoming bids.</p>
             <button onClick={() => setSuccess(false)} className="mt-6 w-full py-3 bg-white text-green-700 font-bold border border-green-200 rounded-xl hover:bg-green-50 transition-colors">
               Post Another Item
             </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
            <form onSubmit={(e) => { e.preventDefault(); setSuccess(true); }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Crop Type</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900" required>
                  <option value="">Select Crop...</option>
                  <option value="tomato">Tomato</option>
                  <option value="onion">Onion</option>
                  <option value="potato">Potato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Available Quantity</label>
                <div className="relative">
                  <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900" placeholder="e.g. 500" required />
                  <span className="absolute right-4 top-3 text-gray-400 font-medium">KG</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Expected Price (Per KG)</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <IndianRupee size={18} />
                  </div>
                  <input type="number" className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900" placeholder="e.g. 45" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Crop Photo</label>
                <div className="w-full p-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload size={24} className="mb-2" />
                  <span className="text-sm font-medium">Tap to Upload</span>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold text-lg shadow-sm transition-colors mt-2">
                List for Buyers
              </button>

            </form>
          </div>
        )}
      </div>
    </main>
  );
}
