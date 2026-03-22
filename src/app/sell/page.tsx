"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ShoppingCart,
  Upload,
  IndianRupee,
  Users,
  Truck,
  Star,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";

type BuyerType = "wholesaler" | "retailer" | "processor";
type QualityGrade = "standard" | "premium" | "processing";

interface ListingForm {
  crop: string;
  quantity: string;
  price: string;
  buyerType: BuyerType;
  district: string;
  quality: QualityGrade;
  sameDayDispatch: boolean;
}

interface BuyerMatch {
  name: string;
  type: BuyerType;
  district: string;
  demand: "High" | "Medium";
  note: string;
}

const DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"];

const CROP_OPTIONS = ["Tomato", "Onion", "Potato", "Paddy", "Chilli", "Brinjal"];

const MARKET_PRICE_HINTS: Record<string, { fair: number; strong: number }> = {
  Tomato: { fair: 18, strong: 24 },
  Onion: { fair: 24, strong: 31 },
  Potato: { fair: 20, strong: 26 },
  Paddy: { fair: 22, strong: 28 },
  Chilli: { fair: 55, strong: 72 },
  Brinjal: { fair: 20, strong: 26 },
};

const BUYER_MATCHES: BuyerMatch[] = [
  {
    name: "Sri Venkateswara Wholesale Yard",
    type: "wholesaler",
    district: "Chennai",
    demand: "High",
    note: "Moves larger lots quickly when quality is uniform.",
  },
  {
    name: "Kovai Fresh Retail Network",
    type: "retailer",
    district: "Coimbatore",
    demand: "High",
    note: "Pays better for clean grading and same-day dispatch.",
  },
  {
    name: "Madurai Processing Hub",
    type: "processor",
    district: "Madurai",
    demand: "Medium",
    note: "Suitable for bulk lots with mixed visual quality.",
  },
  {
    name: "Salem Daily Market Buyers",
    type: "wholesaler",
    district: "Salem",
    demand: "Medium",
    note: "Good fallback when you want faster movement.",
  },
  {
    name: "Trichy Food Processing Cluster",
    type: "processor",
    district: "Tiruchirappalli",
    demand: "High",
    note: "Works well for large volume dispatches above 800 kg.",
  },
  {
    name: "Metro Retail Collection Team",
    type: "retailer",
    district: "Chennai",
    demand: "Medium",
    note: "Best for premium-grade lots and smaller repeat batches.",
  },
];

function getQualityPremium(quality: QualityGrade) {
  switch (quality) {
    case "premium":
      return 3;
    case "processing":
      return -2;
    default:
      return 0;
  }
}

function getDispatchBonus(sameDayDispatch: boolean) {
  return sameDayDispatch ? 1 : 0;
}

function getBuyerAdjustment(type: BuyerType) {
  switch (type) {
    case "retailer":
      return 2;
    case "processor":
      return -1;
    default:
      return 0;
  }
}

export default function BulkSellingPage() {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<ListingForm>({
    crop: "",
    quantity: "",
    price: "",
    buyerType: "wholesaler",
    district: "Chennai",
    quality: "standard",
    sameDayDispatch: false,
  });

  const estimatedRevenue = useMemo(() => {
    const quantity = Number(form.quantity);
    const price = Number(form.price);
    return Number.isFinite(quantity) && Number.isFinite(price) ? quantity * price : 0;
  }, [form.price, form.quantity]);

  const quantityValue = Number(form.quantity) || 0;
  const priceValue = Number(form.price) || 0;

  const suggestedPrice = useMemo(() => {
    const baseline = MARKET_PRICE_HINTS[form.crop]?.fair ?? 20;
    return baseline + getQualityPremium(form.quality) + getDispatchBonus(form.sameDayDispatch) + getBuyerAdjustment(form.buyerType);
  }, [form.buyerType, form.crop, form.quality, form.sameDayDispatch]);

  const priceSignal = useMemo(() => {
    const strongPrice = MARKET_PRICE_HINTS[form.crop]?.strong ?? suggestedPrice + 5;

    if (!priceValue) {
      return {
        label: "Set your expected price",
        tone: "text-gray-700 bg-gray-50 border-gray-200",
        note: "Use the suggested price as a starting point.",
      };
    }

    if (priceValue > strongPrice) {
      return {
        label: "High ask price",
        tone: "text-red-800 bg-red-50 border-red-200",
        note: "Buyer response may slow down unless quality is exceptional.",
      };
    }

    if (priceValue >= suggestedPrice) {
      return {
        label: "Strong range",
        tone: "text-green-800 bg-green-50 border-green-200",
        note: "This price is competitive for the selected buyer type.",
      };
    }

    return {
      label: "Fast-sale range",
      tone: "text-amber-800 bg-amber-50 border-amber-200",
      note: "Lower price can help you move stock faster today.",
    };
  }, [form.crop, priceValue, suggestedPrice]);

  const listingScore = useMemo(() => {
    let score = 0;
    if (form.crop) score += 20;
    if (quantityValue >= 300) score += 25;
    else if (quantityValue > 0) score += 15;
    if (priceValue > 0) score += 20;
    if (form.quality === "premium") score += 15;
    else if (form.quality === "standard") score += 10;
    if (form.sameDayDispatch) score += 10;
    if (form.buyerType === "processor" && quantityValue >= 800) score += 10;
    return Math.min(score, 100);
  }, [form.crop, form.buyerType, form.quality, form.sameDayDispatch, priceValue, quantityValue]);

  const listingStatus = useMemo(() => {
    if (listingScore >= 80) return "Buyer-ready";
    if (listingScore >= 55) return "Good listing";
    return "Needs more details";
  }, [listingScore]);

  const matchedBuyers = useMemo(() => {
    return BUYER_MATCHES.filter(
      (buyer) => buyer.type === form.buyerType || buyer.district === form.district
    )
      .sort((left, right) => {
        const leftScore =
          (left.type === form.buyerType ? 2 : 0) +
          (left.district === form.district ? 2 : 0) +
          (left.demand === "High" ? 1 : 0);
        const rightScore =
          (right.type === form.buyerType ? 2 : 0) +
          (right.district === form.district ? 2 : 0) +
          (right.demand === "High" ? 1 : 0);
        return rightScore - leftScore;
      })
      .slice(0, 3);
  }, [form.buyerType, form.district]);

  const sellingTips = useMemo(() => {
    const tips: string[] = [];

    if (quantityValue < 300) {
      tips.push("Small quantity lots usually work better with retailers.");
    }
    if (quantityValue >= 800) {
      tips.push("Your volume is suitable for processors or large wholesale buyers.");
    }
    if (form.quality === "premium") {
      tips.push("Premium quality can support a better asking price if grading is clean.");
    }
    if (!form.sameDayDispatch) {
      tips.push("Same-day dispatch often improves buyer confidence for perishables.");
    }
    if (form.crop === "Tomato" || form.crop === "Brinjal") {
      tips.push("Perishable crops attract faster bids when you post early in the day.");
    }

    return tips.slice(0, 3);
  }, [form.crop, form.quality, form.sameDayDispatch, quantityValue]);

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
      quality: "standard",
      sameDayDispatch: false,
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
              <span className="text-xs font-semibold uppercase tracking-wide">Buyer fit</span>
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
              Buyers in {form.district} have been notified. Your strongest match is ready for follow-up.
            </p>
            <div className="mt-4 rounded-xl bg-white p-4 text-left border border-green-100 space-y-2">
              <p className="text-sm text-gray-600">Crop</p>
              <p className="font-semibold text-gray-900">{form.crop}</p>
              <p className="text-sm text-gray-600">Expected revenue</p>
              <p className="font-semibold text-gray-900">₹{estimatedRevenue.toLocaleString()}</p>
              {matchedBuyers[0] && (
                <>
                  <p className="text-sm text-gray-600">Best buyer match</p>
                  <p className="font-semibold text-gray-900">{matchedBuyers[0].name}</p>
                </>
              )}
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Listing strength</h2>
                  <p className="text-sm text-gray-500">{listingStatus}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{listingScore}%</p>
                  <p className="text-xs text-gray-500">Buyer readiness</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-[#ea580c] transition-all"
                  style={{ width: `${listingScore}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  Crop: <span className="font-medium text-gray-900">{form.crop || "Select a crop"}</span>
                </p>
                <p>
                  District: <span className="font-medium text-gray-900">{form.district}</span>
                </p>
                <p>
                  Preferred buyer: <span className="font-medium capitalize text-gray-900">{form.buyerType}</span>
                </p>
                <p>
                  Estimated revenue: <span className="font-medium text-gray-900">₹{estimatedRevenue.toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-800">
                <Star className="h-4 w-4" />
                <span className="text-sm font-semibold">Smart price guidance</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-900">₹{suggestedPrice}/kg</p>
              <p className="mt-1 text-sm text-blue-800">
                Suggested target for {form.crop || "this crop"} with {form.quality} quality.
              </p>
              <div className={`mt-3 rounded-xl border p-3 text-sm ${priceSignal.tone}`}>
                <p className="font-semibold">{priceSignal.label}</p>
                <p className="mt-1">{priceSignal.note}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-amber-800">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Top buyer matches</span>
              </div>
              <div className="mt-3 space-y-2">
                {matchedBuyers.map((buyer) => (
                  <div key={buyer.name} className="rounded-xl border border-amber-100 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{buyer.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {buyer.type} • {buyer.district}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        {buyer.demand} demand
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{buyer.note}</p>
                  </div>
                ))}
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
                    {CROP_OPTIONS.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quality Grade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["standard", "premium", "processing"] as const).map((quality) => (
                      <Button
                        key={quality}
                        type="button"
                        variant={form.quality === quality ? "default" : "outline"}
                        onClick={() => updateForm("quality", quality)}
                        className="capitalize"
                      >
                        {quality}
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
                      placeholder={`e.g. ${suggestedPrice}`}
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="h-5 w-5 text-[#ea580c] mt-0.5" />
                    <label className="flex-1 cursor-pointer">
                      <span className="block text-sm font-bold text-gray-800">Same-day dispatch available</span>
                      <span className="mt-1 block text-sm text-gray-600">
                        Turn this on if the crop can be loaded and sent today.
                      </span>
                    </label>
                    <input
                      type="checkbox"
                      checked={form.sameDayDispatch}
                      onChange={(e) => updateForm("sameDayDispatch", e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-gray-300"
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

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900">Quick selling tips</h2>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {sellingTips.map((tip) => (
                  <div key={tip} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    {tip}
                  </div>
                ))}
                {sellingTips.length === 0 && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    Fill crop details to get buyer and pricing suggestions.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
