"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { BottomNav } from "@/components/BottomNav";
import { VoiceExplainer } from "@/components/VoiceExplainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tractor, MapPin, CheckCircle2 } from "lucide-react";
import { MapView } from "@/components/MapView";
import { useState } from "react";
import { calculateTransportCost } from "@/lib/engines";
import { BackButton } from "@/components/BackButton";

export default function TransportPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [weight, setWeight] = useState("");
  const [cost, setCost] = useState<number | null>(null);

  const vehicles = [
    { driver: "Ramesh Kumar", type: "Mini Truck", totalCap: 1500, capLeft: "800kg left", route: "Farm to City Market", price: "₹150/km", lat: 20.62, lng: 78.95, distanceKm: 15, mileage: 12, fuelPrice: 100 },
    { driver: "Abdul Khan", type: "Tractor", totalCap: 2000, capLeft: "1200kg left", route: "Village to Cold Storage", price: "₹200/km", lat: 20.55, lng: 79.0, distanceKm: 8, mileage: 8, fuelPrice: 100 },
  ];

  const handleCalculateCost = (v: any) => {
    if (!weight) return;
    const estimatedCost = calculateTransportCost({
      distanceKm: v.distanceKm,
      fuelPricePerLitre: v.fuelPrice,
      vehicleMileageKmPerLitre: v.mileage,
      totalCropWeightKg: v.totalCap,
      singleFarmerWeightKg: parseInt(weight)
    });
    setCost(Math.round(estimatedCost));
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate DB insert for transport join
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
      setWeight("");
      setCost(null);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <VoiceExplainer textKey="voice_transport_explainer" />
      <BackButton />
      
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#15803d] rounded-full p-4 mb-4 shadow-sm">
          <Tractor size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("shared_transport" as any) || "Shared Transport"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("transport_desc" as any) || "Coordinate and lower costs"}
        </p>
      </div>

      <div className="p-4 space-y-4">
         <MapView 
           markers={vehicles.map(v => ({ lat: v.lat, lng: v.lng, title: v.driver }))} 
           destination={{ lat: 20.65, lng: 79.0 }} // Mock city market destination for routing demonstration
         />
      </div>

      <div className="p-4 space-y-4 mt-2">
        {vehicles.map((v, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-orange-100 rounded-bl-2xl">
              <Tractor className="text-orange-500" size={24} />
            </div>
            <h3 className="font-bold text-xl text-gray-800">{v.type}</h3>
            <p className="text-sm text-gray-500 mb-4">{v.driver}</p>
            
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin size={16} className="mr-2 text-gray-400" />
              {v.route}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{t("storage_capacity" as any) || "Capacity"}: {v.capLeft}</div>
              <div className="text-green-600 font-bold">{v.price}</div>
            </div>

            <Dialog>
              <DialogTrigger render={<Button className="w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 rounded-xl" />}>
                {t("join_transport")}
              </DialogTrigger>
              <DialogContent className="rounded-3xl p-6">
                 <DialogHeader>
                  <DialogTitle className="text-2xl text-orange-600">{t("join_transport")}</DialogTitle>
                </DialogHeader>
                {success ? (
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <CheckCircle2 size={64} className="text-green-500" />
                    <h2 className="text-xl font-bold text-gray-800">{t("booking_success" as any) || "Joined Successfully!"}</h2>
                  </div>
                ) : (
                  <form onSubmit={handleJoin} className="space-y-4 mt-4">
                    <p className="text-sm text-gray-500 mb-2">Calculate your share of the transport cost.</p>
                    <Input 
                      type="number" 
                      placeholder="My Crop Weight (kg)" 
                      value={weight} 
                      onChange={e => {
                        setWeight(e.target.value);
                        setCost(null);
                      }} 
                      required 
                    />
                    
                    {cost !== null && (
                      <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-orange-800 font-medium">Your Estimated Share:</span>
                        <span className="text-2xl font-bold text-green-600">₹{cost}</span>
                      </div>
                    )}

                    {cost === null ? (
                      <Button type="button" onClick={() => handleCalculateCost(v)} className="w-full py-6 text-lg bg-gray-800 hover:bg-gray-900 rounded-xl">
                        Calculate Cost
                      </Button>
                    ) : (
                      <Button type="submit" disabled={loading} className="w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 rounded-xl">
                        {loading ? "..." : "Confirm & Join"}
                      </Button>
                    )}
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
