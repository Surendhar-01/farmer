"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { BottomNav } from "@/components/BottomNav";
import { VoiceExplainer } from "@/components/VoiceExplainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, MapPin, Snowflake, CheckCircle2 } from "lucide-react";
import { MapView } from "@/components/MapView";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BackButton } from "@/components/BackButton";

interface StorageEntry {
  id: string;
  name: string;
  address: string;
  dist: string;
  cap: string;
  price: string;
  lat: number;
  lng: number;
}

interface StorageSearchResult {
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
}

export default function StoragePage() {
  const { t } = useLanguage();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    farmer_name: "",
    crop_type: "",
    quantity: "",
    days_required: ""
  });

  const [storages, setStorages] = useState<StorageEntry[]>([
    // Fallback: Authentic TNAU Data from Government of Tamil Nadu Agritech Portal
    { id: "tn1", name: "Raja Cold Storage", address: "Sendurai main road, Ariyalur-621 704", dist: "Regional", cap: "100 MT", price: "₹25/kg/day", lat: 11.139, lng: 79.076 },
    { id: "tn2", name: "Tamil Nadu Coop marketing Fed. Ltd", address: "Basin bridge road, Chennai-600 012", dist: "Regional", cap: "200 MT", price: "₹20/kg/day", lat: 13.098, lng: 80.269 },
    { id: "tn3", name: "Department of racing Guindy", address: "Chennai-32", dist: "Regional", cap: "50 MT", price: "Gov Rate", lat: 13.011, lng: 80.222 },
    { id: "tn4", name: "Pukharaj Mohanlal", address: "169, Govindappa Naik st, Chennai-1", dist: "Regional", cap: "150 MT", price: "₹25/kg/day", lat: 13.090, lng: 80.280 },
  ]);

  const fetchNearbyStorage = async (latitude: number, longitude: number) => {
    try {
      // Free OpenStreetMap Nominatim API for general nearby searches
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=cold+storage&format=json&limit=2&lat=${latitude}&lon=${longitude}`
      );
      const data = (await response.json()) as StorageSearchResult[];
      
      const storageOptions = data.map((item, i) => ({
        id: i.toString(),
        name: item.name || item.display_name.split(",")[0] || "Regional Cold Storage",
        address: item.display_name,
        dist: "12 km", // Mock distance
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        price: "₹25/kg/day",
        cap: "500 MT"
      }));
      
      if (storageOptions.length > 0) {
        // Prepend dynamically found OSM locations to our authentic TNAU fallback locations
        setStorages((prev) => [...storageOptions, ...prev]);
      }
    } catch (err) {
      console.error("OSM Places Error", err);
    }
  };

  useEffect(() => {
    // Example coordinates (central TN approx)
    fetchNearbyStorage(11.127, 78.656); 
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('cold_storage_bookings').insert([{
        farmer_name: form.farmer_name,
        crop_type: form.crop_type,
        quantity: parseInt(form.quantity),
        days_required: parseInt(form.days_required)
      }]);
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
      <VoiceExplainer textKey="voice_storage_explainer" />
      <BackButton />
      
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#15803d] rounded-full p-4 mb-4 shadow-sm">
          <Snowflake size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("cold_storage") || "Cold Storage Locator"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("storage_desc") || "Find and book nearby storage"}
        </p>
      </div>

      <div className="p-4 space-y-4">
         <MapView markers={storages.map((storage) => ({ lat: storage.lat, lng: storage.lng, title: storage.name }))} />
      </div>

      <div className="p-4 space-y-4 mt-2">
        {storages.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-blue-100 rounded-bl-2xl">
              <Building className="text-blue-800" size={24} />
            </div>
            <h3 className="font-bold text-xl text-gray-800 pr-10">{s.name}</h3>
            
            <div className="flex items-center text-sm text-gray-600 mb-2 mt-2">
              <MapPin size={16} className="mr-2 text-gray-400" />
               {s.dist} {t("distance") || "away"} 
            </div>
            
            <div className="flex justify-between items-center mb-4 mt-3">
              <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{t("storage_capacity") || "Capacity"}: {s.cap}</div>
              <div className="text-gray-800 font-bold">{s.price}</div>
            </div>

            <Dialog>
              <DialogTrigger render={<Button className="w-full py-6 text-lg bg-blue-800 hover:bg-blue-900 rounded-xl" />}>
                {t("book_now") || t("book_storage")}
              </DialogTrigger>
              <DialogContent className="rounded-3xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-blue-800">{t("book_storage")}</DialogTitle>
                </DialogHeader>
                {bookingSuccess ? (
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <CheckCircle2 size={64} className="text-green-500" />
                    <h2 className="text-xl font-bold text-gray-800">{t("booking_success") || "Booking Successful!"}</h2>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4 mt-4">
                    <Input placeholder="Farmer Name" value={form.farmer_name} onChange={e => setForm({...form, farmer_name: e.target.value})} required />
                    <Input placeholder="Crop Type (e.g., Tomato)" value={form.crop_type} onChange={e => setForm({...form, crop_type: e.target.value})} required />
                    <Input type="number" placeholder="Quantity (kg)" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
                    <Input type="number" placeholder="Days Required" value={form.days_required} onChange={e => setForm({...form, days_required: e.target.value})} required />
                    <Button type="submit" disabled={loading} className="w-full py-6 text-lg bg-blue-800 hover:bg-blue-900 rounded-xl">
                      {loading ? "..." : (t("book_now") || "Book Now")}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
