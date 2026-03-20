"use client";

import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { BottomNav } from "@/components/BottomNav";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Building, CheckCircle2, MapPin, Search, Snowflake } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface StorageEntry {
  id: string;
  name: string;
  address: string;
  district: string;
  capacity: string;
  item: string;
  sector: string;
}

interface CropEntry {
  name_en: string;
}

export default function StoragePage() {
  const { t } = useLanguage();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cropOptions, setCropOptions] = useState<string[]>([]);
  const [storages, setStorages] = useState<StorageEntry[]>([]);
  const [searchArea, setSearchArea] = useState("");

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("cold_storage_bookings").insert([
        {
          farmer_name: form.farmer_name,
          crop_type: form.crop_type,
          quantity: Number.parseInt(form.quantity, 10),
          days_required: Number.parseInt(form.days_required, 10),
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

  const filteredStorages = storages.filter((storage) =>
    [storage.name, storage.address, storage.district, storage.item, storage.sector]
      .join(" ")
      .toLowerCase()
      .includes(searchArea.trim().toLowerCase())
  );

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

      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
            placeholder="Search by area, district, or address"
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-2 space-y-4 p-4">
        {filteredStorages.map((storage) => (
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

            <div className="mb-4 mt-3 flex items-center justify-between">
              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {t("storage_capacity") || "Capacity"}: {storage.capacity}
              </div>
              <div className="font-bold capitalize text-gray-800">{storage.sector}</div>
            </div>

            <div className="mb-4 text-sm capitalize text-gray-600">
              Stored item: {storage.item}
            </div>

            <Dialog>
              <DialogTrigger
                render={<Button className="w-full rounded-xl bg-blue-800 py-6 text-lg hover:bg-blue-900" />}
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
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="mt-4 space-y-4">
                    <Input
                      placeholder="Farmer Name"
                      value={form.farmer_name}
                      onChange={(e) => setForm({ ...form, farmer_name: e.target.value })}
                      required
                    />
                    <Input
                      list="crop-options"
                      placeholder="Crop Type (e.g., Tomato)"
                      value={form.crop_type}
                      onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
                      required
                    />
                    <datalist id="crop-options">
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
        ))}
        {filteredStorages.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
            No cold storage found for that area.
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
