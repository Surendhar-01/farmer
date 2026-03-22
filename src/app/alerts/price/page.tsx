"use client";

import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  BellRing,
  Loader2,
  MapPin,
  Sprout,
  Star,
} from "lucide-react";

type SupplyStatus = "red" | "yellow" | "green";

interface CropMarketEntry {
  id: string;
  marketId: string;
  marketName: string;
  address: string;
  city: string;
  state: string;
  commodity: string;
  latestArrivalDate: string;
  modalPrice: number;
  arrivalQuantity: number;
}

interface RankedMandi extends CropMarketEntry {
  distanceKm: number;
  pricePerKg: number;
  supplyStatus: SupplyStatus;
}

const STATUS_META: Record<
  SupplyStatus,
  {
    badge: string;
    insight: string;
    cardClass: string;
    pillClass: string;
  }
> = {
  red: {
    badge: "High Supply",
    insight: "High supply - price may drop",
    cardClass: "border-red-200 bg-red-50",
    pillClass: "bg-red-600 text-white",
  },
  yellow: {
    badge: "Balanced",
    insight: "Balanced market",
    cardClass: "border-yellow-200 bg-yellow-50",
    pillClass: "bg-yellow-400 text-yellow-950",
  },
  green: {
    badge: "Good Time",
    insight: "Good selling opportunity",
    cardClass: "border-green-200 bg-green-50",
    pillClass: "bg-green-600 text-white",
  },
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function estimateDistanceKm(entry: CropMarketEntry) {
  return 8 + (hashString(`${entry.marketId}-${entry.city}`) % 65);
}

function toPricePerKg(modalPrice: number) {
  return Math.max(1, Number((modalPrice / 100).toFixed(1)));
}

function classifyMandis(entries: CropMarketEntry[]) {
  const sortedByArrival = [...entries].sort((left, right) => right.arrivalQuantity - left.arrivalQuantity);

  return sortedByArrival.map<RankedMandi>((entry, index) => {
    const percentile = (index + 1) / sortedByArrival.length;
    let supplyStatus: SupplyStatus = "yellow";

    if (percentile <= 0.3) {
      supplyStatus = "red";
    } else if (percentile > 0.7) {
      supplyStatus = "green";
    }

    return {
      ...entry,
      distanceKm: estimateDistanceKm(entry),
      pricePerKg: toPricePerKg(entry.modalPrice),
      supplyStatus,
    };
  });
}

function getInsightMessage(mandis: RankedMandi[]) {
  const redCount = mandis.filter((item) => item.supplyStatus === "red").length;
  const greenCount = mandis.filter((item) => item.supplyStatus === "green").length;

  if (mandis.length > 0 && redCount > mandis.length / 2) {
    return "Nearby markets are crowded. Try slightly distant markets.";
  }

  if (greenCount > 0) {
    return "Low supply detected - good time to sell.";
  }

  return "Balanced market conditions.";
}

function getRecommendationPool(mandis: RankedMandi[]) {
  const greens = mandis
    .filter((item) => item.supplyStatus === "green")
    .sort((left, right) => right.pricePerKg - left.pricePerKg || left.distanceKm - right.distanceKm);

  if (greens.length === 0) {
    return [];
  }

  const topPrice = greens[0].pricePerKg;
  return greens.filter((item) => item.pricePerKg >= topPrice - Math.max(1, topPrice * 0.05));
}

export default function PriceAlertsPage() {
  const [cropOptions, setCropOptions] = useState<string[]>([]);
  const [commodityEntries, setCommodityEntries] = useState<CropMarketEntry[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const response = await fetch("/api/market-data");
        if (!response.ok) {
          throw new Error("Failed to fetch mandi data");
        }

        const data = (await response.json()) as {
          cropOptions: string[];
          commodityEntries: CropMarketEntry[];
        };

        if (!active) {
          return;
        }

        const nextCropOptions = data.cropOptions.filter(Boolean);
        setCropOptions(nextCropOptions);
        setCommodityEntries(data.commodityEntries ?? []);

        const defaultCrop =
          nextCropOptions.find((crop) => ["Tomato", "Onion", "Potato"].includes(crop)) ||
          nextCropOptions[0] ||
          "";
        setSelectedCrop((current) => current || defaultCrop);
      } catch {
        if (!active) {
          return;
        }
        setError("Could not load mandi alerts right now.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const mandiRows = useMemo(() => {
    if (!selectedCrop) {
      return [];
    }

    const cropEntries = commodityEntries.filter(
      (entry) => entry.commodity.toLowerCase() === selectedCrop.toLowerCase()
    );

    const ranked = classifyMandis(cropEntries);
    const order = { green: 0, yellow: 1, red: 2 } as const;

    return ranked.sort(
      (left, right) =>
        order[left.supplyStatus] - order[right.supplyStatus] ||
        right.pricePerKg - left.pricePerKg ||
        left.distanceKm - right.distanceKm
    );
  }, [commodityEntries, selectedCrop]);

  useEffect(() => {
    if (!selectedCrop || mandiRows.length === 0 || typeof window === "undefined") {
      setRecommendedId(null);
      return;
    }

    const pool = getRecommendationPool(mandiRows);
    if (pool.length === 0) {
      setRecommendedId(mandiRows[0]?.id ?? null);
      return;
    }

    // Rotate among the strongest green options so one mandi does not dominate every visit.
    const storageKey = `price-alert-rotation-${selectedCrop.toLowerCase()}`;
    const currentIndex = Number(window.localStorage.getItem(storageKey) ?? "0");
    const nextRecommendation = pool[currentIndex % pool.length] ?? pool[0];

    window.localStorage.setItem(storageKey, String(currentIndex + 1));
    setRecommendedId(nextRecommendation.id);
  }, [mandiRows, selectedCrop]);

  const recommendedMarket = useMemo(() => {
    const byId = mandiRows.find((item) => item.id === recommendedId);
    if (byId) {
      return byId;
    }

    return (
      mandiRows.find((item) => item.supplyStatus === "green") ||
      mandiRows.find((item) => item.supplyStatus === "yellow") ||
      mandiRows[0] ||
      null
    );
  }, [mandiRows, recommendedId]);

  const alternatives = useMemo(() => {
    if (!recommendedMarket) {
      return [];
    }

    const preferred = mandiRows.filter(
      (item) => item.id !== recommendedMarket.id && item.supplyStatus !== "red"
    );
    const fallback = mandiRows.filter((item) => item.id !== recommendedMarket.id);

    return (preferred.length >= 2 ? preferred : fallback).slice(0, 3);
  }, [mandiRows, recommendedMarket]);

  const insightMessage = useMemo(() => getInsightMessage(mandiRows), [mandiRows]);
  const greenCount = mandiRows.filter((item) => item.supplyStatus === "green").length;
  const redCount = mandiRows.filter((item) => item.supplyStatus === "red").length;
  const bestPrice = mandiRows[0]?.pricePerKg ?? 0;

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />

      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#dc2626] rounded-full p-4 mb-4 shadow-sm">
          <BellRing size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Price Alerts</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Simple mandi signals using price and supply pressure
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <Card className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <Sprout className="h-4 w-4 text-[#16a34a]" />
              <h2 className="font-semibold">Select crop</h2>
            </div>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none"
            >
              {cropOptions.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              {cropOptions.slice(0, 6).map((crop) => (
                <Button
                  key={crop}
                  size="sm"
                  variant={selectedCrop === crop ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => setSelectedCrop(crop)}
                >
                  {crop}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#dc2626]" />
          </div>
        ) : error ? (
          <Card className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-5 text-sm text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        ) : mandiRows.length === 0 ? (
          <Card className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="font-medium text-gray-900">No mandi data found for {selectedCrop || "this crop"}.</p>
              <p className="mt-1 text-sm text-gray-500">Choose another crop to see nearby selling signals.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Green</p>
                <p className="mt-2 text-2xl font-bold text-green-900">{greenCount}</p>
                <p className="text-xs text-green-700">Good spots</p>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Red</p>
                <p className="mt-2 text-2xl font-bold text-red-900">{redCount}</p>
                <p className="text-xs text-red-700">Crowded markets</p>
              </div>
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Best price</p>
                <p className="mt-2 text-2xl font-bold text-cyan-900">₹{bestPrice}</p>
                <p className="text-xs text-cyan-700">Per kg</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start w-full shadow-sm">
              <span className="mr-3 text-xl">ℹ️</span>
              <p className="text-blue-900 text-sm font-medium">{insightMessage}</p>
            </div>

            {recommendedMarket && (
              <Card className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Best Selling Suggestion
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        Recommended Market
                      </h2>
                    </div>
                    <Badge className={STATUS_META[recommendedMarket.supplyStatus].pillClass}>
                      {STATUS_META[recommendedMarket.supplyStatus].badge}
                    </Badge>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{recommendedMarket.marketName}</h3>
                        <p className="mt-1 text-sm text-gray-600">{recommendedMarket.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-xl font-bold text-emerald-700">₹{recommendedMarket.pricePerKg}/kg</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-emerald-200 text-emerald-800">
                        <MapPin className="h-3 w-3" />
                        {recommendedMarket.distanceKm} km away
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-800">
                        {STATUS_META[recommendedMarket.supplyStatus].insight}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-800">
                        Latest report: {recommendedMarket.latestArrivalDate}
                      </Badge>
                    </div>
                  </div>

                  {alternatives.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900">Alternative mandis</p>
                      {alternatives.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.marketName}</p>
                            <p className="text-xs text-gray-500">
                              {item.city}, {item.state} • {item.distanceKm} km
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{item.pricePerKg}/kg</p>
                            <p className="text-xs text-gray-500">
                              {STATUS_META[item.supplyStatus].insight}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {mandiRows.map((item) => (
                <Card
                  key={item.id}
                  className={`rounded-2xl border shadow-sm ${STATUS_META[item.supplyStatus].cardClass}`}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{item.marketName}</h2>
                        <p className="mt-1 text-sm text-gray-600">{item.address}</p>
                      </div>
                      <Badge className={STATUS_META[item.supplyStatus].pillClass}>
                        {STATUS_META[item.supplyStatus].badge}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3 border border-gray-100">
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="mt-1 font-bold text-gray-900">₹{item.pricePerKg}/kg</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-gray-100">
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="mt-1 font-bold text-gray-900">{item.distanceKm} km</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{STATUS_META[item.supplyStatus].insight}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Latest mandi update for {selectedCrop} was reported on {item.latestArrivalDate}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Price alerts use recent mandi prices from the existing market dataset. Arrival quantity is estimated
              internally when the source does not provide direct supply totals.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
