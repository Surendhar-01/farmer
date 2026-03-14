"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { ShoppingCart, Upload, IndianRupee, Users, Truck } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

interface ListingForm {
  crop: string;
  quantity: string;
  price: string;
  buyerType: "wholesaler" | "retailer" | "processor";
  district: string;
}

const DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"];

export default function BulkSellingPage() {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<ListingForm>({
    crop: "",
    quantity: "",
    price: "",
    buyerType: "wholesaler",
    district: "Chennai",
  });

  const estimatedRevenue = useMemo(() => {
    const quantity = Number(form.quantity);
    const price = Number(form.price);
    return Number.isFinite(quantity) && Number.isFinite(price) ? quantity * price : 0;
  }, [form.price, form.quantity]);

  const updateForm = <K extends keyof ListingForm>(key: K, value: ListingForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      crop: "",
      quantity: "",
      price: "",
      buyerType: "wholesaler",
      district: "Chennai",
    });
    setSuccess(false);
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#ea580c] rounded-full p-4 mb-4 shadow-sm">
          <ShoppingCart size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("bulk_selling") || "Bulk Selling"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("bulk_desc") || "Sell your crops directly in bulk"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-700">
              <Users className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Buyer type</span>
            </div>
            <p className="mt-2 text-lg font-bold capitalize text-orange-900">{form.buyerType}</p>
            <p className="text-xs text-orange-700">Current preferred buyer</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <Truck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Est. revenue</span>
            </div>
            <p className="mt-2 text-lg font-bold text-emerald-900">₹{estimatedRevenue.toLocaleString()}</p>
            <p className="text-xs text-emerald-700">Based on current quantity and price</p>
          </div>
        </div>

        {success ? (
          <div className="bg-green-50 rounded-2xl p-8 border border-green-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h2 className="font-bold text-xl text-green-900 mb-2">Listing Posted!</h2>
            <p className="text-green-700 text-sm">
              Buyers in {form.district} have been notified. You will receive SMS alerts for incoming bids.
            </p>
            <div className="mt-4 rounded-xl bg-white p-4 text-left border border-green-100">
              <p className="text-sm text-gray-600">Crop</p>
              <p className="font-semibold text-gray-900">{form.crop}</p>
              <p className="mt-2 text-sm text-gray-600">Expected revenue</p>
              <p className="font-semibold text-gray-900">₹{estimatedRevenue.toLocaleString()}</p>
            </div>
            <button
              onClick={resetForm}
              className="mt-6 w-full py-3 bg-white text-green-700 font-bold border border-green-200 rounded-xl hover:bg-green-50 transition-colors"
            >
              Post Another Item
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900">Listing preview</h2>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>Crop: <span className="font-medium text-gray-900">{form.crop || "Select a crop"}</span></p>
                <p>District: <span className="font-medium text-gray-900">{form.district}</span></p>
                <p>Preferred buyer: <span className="font-medium capitalize text-gray-900">{form.buyerType}</span></p>
                <p>Estimated revenue: <span className="font-medium text-gray-900">₹{estimatedRevenue.toLocaleString()}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSuccess(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Crop Type</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    value={form.crop}
                    onChange={(e) => updateForm("crop", e.target.value)}
                    required
                  >
                    <option value="">Select Crop...</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Potato">Potato</option>
                    <option value="Paddy">Paddy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    value={form.district}
                    onChange={(e) => updateForm("district", e.target.value)}
                  >
                    {DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preferred Buyer</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["wholesaler", "retailer", "processor"] as const).map((buyerType) => (
                      <Button
                        key={buyerType}
                        type="button"
                        variant={form.buyerType === buyerType ? "default" : "outline"}
                        onClick={() => updateForm("buyerType", buyerType)}
                        className="capitalize"
                      >
                        {buyerType}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Available Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                      placeholder="e.g. 500"
                      value={form.quantity}
                      onChange={(e) => updateForm("quantity", e.target.value)}
                      required
                    />
                    <span className="absolute right-4 top-3 text-gray-400 font-medium">KG</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expected Price (Per KG)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <IndianRupee size={18} />
                    </div>
                    <input
                      type="number"
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                      placeholder="e.g. 45"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Crop Photo</label>
                  <div className="w-full p-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-medium">Tap to Upload</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold text-lg shadow-sm transition-colors mt-2"
                >
                  List for Buyers
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
