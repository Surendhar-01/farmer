"use client";

import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { BottomNav } from "@/components/BottomNav";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Building,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  Snowflake,
  Star,
  ShieldCheck,
  Clock3,
  Navigation,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface StorageEntry {
  id: string;
  name: string;
  address: string;
  district: string;
  capacity: string;
  item: string;
  sector: string;
  phone: string;
}

interface CropEntry {
  name_en: string;
}

function parseCapacity(capacity: string) {
  const numeric = Number.parseInt(capacity.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getStorageSuitability(cropType: string, storage: StorageEntry) {
  const crop = cropType.toLowerCase();
  const capacity = parseCapacity(storage.capacity);

  if (!crop) {
    return {
      label: "General fit",
      note: "Select a crop to see a more specific recommendation.",
      tone: "border-gray-200 bg-gray-50 text-gray-700",
    };
  }

  if (["tomato", "brinjal", "chilli"].includes(crop) && capacity >= 5000) {
    return {
      label: "Best for perishables",
      note: "Good option if you need quick cooling support for fresh produce.",
      tone: "border-green-200 bg-green-50 text-green-800",
    };
  }

  if (["onion", "potato"].includes(crop)) {
    return {
      label: "Strong storage fit",
      note: "Suitable for crops that need short-term holding before sale.",
      tone: "border-blue-200 bg-blue-50 text-blue-800",
    };
  }

  return {
    label: "Check storage conditions",
    note: "Call first to confirm handling for this crop and expected holding period.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  };
}

function estimateStorageCost(quantity: number, days: number) {
  if (!quantity || !days) return 0;
  return Math.round(quantity * days * 0.6);
}

function getDistrictPriority(searchArea: string, storage: StorageEntry) {
  if (!searchArea.trim()) return 0;
  const query = searchArea.trim().toLowerCase();
  return [storage.name, storage.address, storage.district].join(" ").toLowerCase().includes(query) ? 2 : 0;
}

export default function StoragePage() {
  const { t } = useLanguage();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cropOptions, setCropOptions] = useState<string[]>([]);
  const [storages, setStorages] = useState<StorageEntry[]>([]);
  const [searchArea, setSearchArea] = useState("");
  const [activeStorage, setActiveStorage] = useState<StorageEntry | null>(null);

  const [form, setForm] = useState({
    farmer_name: "",
    crop_type: "",
    quantity: "",
    days_required: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schemaResponse, storageResponse] = await Promise.all([
          fetch("/api/schema-data"),
          fetch("/api/storage-data"),
        ]);

        if (schemaResponse.ok) {
          const schemaData = (await schemaResponse.json()) as { crops: CropEntry[] };
          setCropOptions(schemaData.crops.map((crop) => crop.name_en));
        }

        if (storageResponse.ok) {
          const storageData = (await storageResponse.json()) as { storages: StorageEntry[] };
          setStorages(storageData.storages);
        }
      } catch {
        // ignore
      }
    };

    void loadData();
  }, []);

  const quantityValue = Number.parseInt(form.quantity, 10) || 0;
  const daysValue = Number.parseInt(form.days_required, 10) || 0;
  const estimatedCost = estimateStorageCost(quantityValue, daysValue);

  const filteredStorages = useMemo(() => {
    return storages
      .filter((storage) =>
        [storage.name, storage.address, storage.district, storage.item, storage.sector]
          .join(" ")
          .toLowerCase()
          .includes(searchArea.trim().toLowerCase())
      )
      .sort((left, right) => {
        const leftScore =
          getDistrictPriority(searchArea, left) +
          (form.crop_type ? (getStorageSuitability(form.crop_type, left).label.includes("Best") ? 2 : 1) : 0) +
          (parseCapacity(left.capacity) >= 5000 ? 1 : 0);
        const rightScore =
          getDistrictPriority(searchArea, right) +
          (form.crop_type ? (getStorageSuitability(form.crop_type, right).label.includes("Best") ? 2 : 1) : 0) +
          (parseCapacity(right.capacity) >= 5000 ? 1 : 0);

        return rightScore - leftScore;
      });
  }, [form.crop_type, searchArea, storages]);

  const recommendedStorage = filteredStorages[0] ?? null;

  const storageTips = useMemo(() => {
    const tips: string[] = [];

    if (["Tomato", "Brinjal", "Chilli"].includes(form.crop_type)) {
      tips.push("Perishable crops should be cooled quickly after harvest to reduce quality loss.");
    }
    if (daysValue > 10) {
      tips.push("For longer storage periods, confirm ventilation, moisture, and unloading terms before booking.");
    }
    if (quantityValue >= 1000) {
      tips.push("Large lots should be confirmed by phone before travel to avoid unloading delays.");
    }
    if (!form.crop_type) {
      tips.push("Select your crop to see the best storage fit.");
    }

    return tips.slice(0, 3);
  }, [daysValue, form.crop_type, quantityValue]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("cold_storage_bookings").insert([
        {
          farmer_name: form.farmer_name,
          crop_type: form.crop_type,
          quantity: quantityValue,
          days_required: daysValue,
        },
      ]);
      if (!error) {
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 3000);
        setForm({ farmer_name: "", crop_type: "", quantity: "", days_required: "" });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <BackButton />

      <div className="flex w-full flex-col items-center justify-center pb-6 pt-8 text-center">
        <div className="mb-4 rounded-full bg-[#15803d] p-4 shadow-sm">
          <Snowflake size={32} className="text-white" />
        </div>
        <h1 className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">
          {t("cold_storage") || "Cold Storage Locator"}
        </h1>
        <p className="text-sm text-gray-600 md:text-base">
          {t("storage_desc") || "Find and book nearby storage"}
        </p>
      </div>

      <div className="space-y-4 p-4">
        <MapView markers={[]} />
      </div>

      <div className="space-y-4 px-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <Search className="h-4 w-4 text-[#15803d]" />
            <h2 className="font-semibold">Search and crop fit</h2>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="Search by area, district, or address"
              className="pl-10"
            />
          </div>
          <div className="mt-3">
            <Input
              list="crop-options"
              placeholder="Select crop to match storage"
              value={form.crop_type}
              onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
            />
            <datalist id="crop-options">
              {cropOptions.map((crop) => (
                <option key={crop} value={crop} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Best match</p>
            <p className="mt-2 text-sm font-bold text-emerald-900">{recommendedStorage?.district ?? "No match"}</p>
            <p className="text-xs text-emerald-700">Top storage district</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Storages</p>
            <p className="mt-2 text-lg font-bold text-blue-900">{filteredStorages.length}</p>
            <p className="text-xs text-blue-700">Available results</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Est. cost</p>
            <p className="mt-2 text-lg font-bold text-amber-900">₹{estimatedCost}</p>
            <p className="text-xs text-amber-700">For current plan</p>
          </div>
        </div>

        {recommendedStorage && (
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800">
              <Star className="h-4 w-4" />
              <span className="text-sm font-semibold">Recommended storage</span>
            </div>
            <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{recommendedStorage.name}</p>
                  <p className="text-sm text-gray-600">{recommendedStorage.address}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                  {getStorageSuitability(form.crop_type, recommendedStorage).label}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-700">
                {getStorageSuitability(form.crop_type, recommendedStorage).note}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-4 p-4">
        {filteredStorages.map((storage) => {
          const suitability = getStorageSuitability(form.crop_type, storage);

          return (
            <div
              key={storage.id}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-blue-100 p-3">
                <Building className="text-blue-800" size={24} />
              </div>
              <h3 className="pr-10 text-xl font-bold text-gray-800">{storage.name}</h3>

              <div className="mb-2 mt-2 flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-2 text-gray-400" />
                {storage.district}
              </div>

              <p className="mb-3 text-sm text-gray-600">{storage.address}</p>

              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {t("storage_capacity") || "Capacity"}: {storage.capacity}
                </div>
                <div className="font-bold capitalize text-gray-800">{storage.sector}</div>
              </div>

              <div className={`mb-3 rounded-xl border p-3 text-sm ${suitability.tone}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{suitability.label}</span>
                </div>
                <p className="mt-1">{suitability.note}</p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-gray-500">Stored item</p>
                  <p className="mt-1 font-semibold text-gray-900">{storage.item}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock3 className="h-4 w-4" />
                    <span>Plan</span>
                  </div>
                  <p className="mt-1 font-semibold text-gray-900">
                    {daysValue > 0 ? `${daysValue} day${daysValue === 1 ? "" : "s"}` : "Set booking days"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-[#15803d] text-[#15803d] hover:bg-green-50"
                  onClick={() => (window.location.href = `tel:${storage.phone}`)}
                >
                  <Phone size={18} className="mr-2" />
                  {t("call") || "Call"}
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${storage.name}, ${storage.address}`
                      )}`,
                      "_blank"
                    )
                  }
                >
                  <Navigation size={18} className="mr-2" />
                  Directions
                </Button>
              </div>

              <div className="mt-3">
                <Dialog>
                  <DialogTrigger
                    render={<Button className="w-full rounded-xl bg-blue-800 py-6 text-lg hover:bg-blue-900" />}
                    onClick={() => {
                      setActiveStorage(storage);
                      setBookingSuccess(false);
                    }}
                  >
                    {t("book_now") || t("book_storage")}
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl p-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-blue-800">
                        {t("book_storage")}
                      </DialogTitle>
                    </DialogHeader>
                    {bookingSuccess ? (
                      <div className="flex flex-col items-center justify-center space-y-4 p-6">
                        <CheckCircle2 size={64} className="text-green-500" />
                        <h2 className="text-xl font-bold text-gray-800">
                          {t("booking_success") || "Booking Successful!"}
                        </h2>
                        {activeStorage && (
                          <p className="text-center text-sm text-gray-600">
                            Your request has been created for {activeStorage.name}.
                          </p>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleBooking} className="mt-4 space-y-4">
                        {activeStorage && (
                          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                            Booking for <span className="font-semibold">{activeStorage.name}</span> in{" "}
                            <span className="font-semibold">{activeStorage.district}</span>
                          </div>
                        )}
                        <Input
                          placeholder="Farmer Name"
                          value={form.farmer_name}
                          onChange={(e) => setForm({ ...form, farmer_name: e.target.value })}
                          required
                        />
                        <Input
                          list="booking-crop-options"
                          placeholder="Crop Type (e.g., Tomato)"
                          value={form.crop_type}
                          onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
                          required
                        />
                        <datalist id="booking-crop-options">
                          {cropOptions.map((crop) => (
                            <option key={crop} value={crop} />
                          ))}
                        </datalist>
                        <Input
                          type="number"
                          placeholder="Quantity (kg)"
                          value={form.quantity}
                          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Days Required"
                          value={form.days_required}
                          onChange={(e) => setForm({ ...form, days_required: e.target.value })}
                          required
                        />
                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
                          Estimated storage plan cost: <span className="font-semibold">₹{estimatedCost}</span>
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-xl bg-blue-800 py-6 text-lg hover:bg-blue-900"
                        >
                          {loading ? "..." : t("book_now") || "Book Now"}
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
        {filteredStorages.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
            No cold storage found for that area.
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">Storage tips</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            {storageTips.map((tip) => (
              <div key={tip} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
