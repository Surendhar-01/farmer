"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { useLanguage } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Sprout,
  Store,
  TrendingUp,
} from "lucide-react";

interface MarketEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  products: string[];
  type: "market";
  active: boolean;
  latestArrivalDate: string;
  averageModalPrice: number;
}

function formatKey(key: string) {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function findBestLocationMatch(query: string, locations: string[]) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return "";

  return (
    locations.find((location) => location.toLowerCase() === normalizedQuery) ||
    locations.find((location) => location.toLowerCase().includes(normalizedQuery)) ||
    locations.find((location) => normalizedQuery.includes(location.toLowerCase())) ||
    ""
  );
}

const detectCurrentLocation = () =>
  new Promise<[number, number]>((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.warn("[v0] Geolocation unavailable in this browser/context");
      reject(new Error("Geolocation unavailable"));
      return;
    }

    console.log("[v0] Requesting geolocation...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("[v0] Lat/Lng received:", position.coords.latitude, position.coords.longitude);
        resolve([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("[v0] Geolocation error:", error.code, error.message);
        reject(error);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  });

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    console.log("[v0] Reverse geocoding coords:", lat, lng);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "FarmAssist-App/1.0"
        },
      }
    );

    if (!response.ok) {
      console.error("[v0] Nominatim API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("[v0] Nominatim raw data:", data);
    const address = data?.address ?? {};
    const city = address.city || address.town || address.village || "";
    const district = address.county || address.state_district || "";
    const state = address.state || "";
    const label =
      [address.suburb, city || district, state].filter(Boolean).join(", ") ||
      data?.display_name ||
      "";

    const result = { city, district, state, label };
    console.log("[v0] Geocoding result:", result);
    return result;
  } catch (error) {
    console.error("[v0] Reverse geocoding exception:", error);
    return null;
  }
};

export default function MarketPage() {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState<MarketEntry[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [cropOptions, setCropOptions] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState("");
  const [currentPlaceLabel, setCurrentPlaceLabel] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);

  const translate = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const getLocationErrorMessage = useCallback(
    (error?: GeolocationPositionError | Error) => {
      if (!error || !("code" in error)) {
        return translate("location_fetch_failed", "Could not refresh your current location.");
      }

      switch (error.code) {
        case 1:
          return translate(
            "location_permission_denied",
            "Location permission was denied. Allow location access in your browser."
          );
        case 2:
          return translate(
            "location_unavailable",
            "Current location is unavailable on this device."
          );
        case 3:
          return translate("location_timeout", "Location request timed out. Try again.");
        default:
          return translate("location_fetch_failed", "Could not refresh your current location.");
      }
    },
    [translate]
  );

  useEffect(() => {
    let active = true;

    const loadMarkets = async () => {
      try {
        const response = await fetch("/api/market-data");
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }

        const data = (await response.json()) as {
          markets: MarketEntry[];
          locations: string[];
          cropOptions: string[];
        };

        if (!active) return;
        setMarkets(data.markets);
        setLocationOptions(data.locations);
        setCropOptions(data.cropOptions);
      } catch {
        if (!active) return;
        setLocationError(translate("data_load_failed", "Could not load market data."));
      } finally {
        if (active) {
          setIsLoadingMarkets(false);
        }
      }
    };

    void loadMarkets();

    return () => {
      active = false;
    };
  }, [translate]);

  const applyDetectedLocation = useCallback(
    async (coords: [number, number]) => {
      console.log("[v0] Applying detected coords to markets...");
      const resolved = await reverseGeocode(coords[0], coords[1]);
      
      if (!resolved) {
        console.warn("[v0] Could not resolve coordinates to an address");
        setUserLocation(coords);
        setCurrentPlaceLabel(`${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
        return;
      }

      const candidates = [
        resolved.city,
        resolved.district,
        resolved.state,
        resolved.district && resolved.state ? `${resolved.district}, ${resolved.state}` : "",
      ].filter(Boolean) as string[];

      console.log("[v0] Match candidates:", candidates);

      const resolvedCity =
        candidates
          .map((candidate) => {
            const match = findBestLocationMatch(candidate, locationOptions);
            if (match) console.log("[v0] Found match:", candidate, "->", match);
            return match;
          })
          .find(Boolean) || "";

      setUserLocation(coords);
      setCurrentCity(resolvedCity);
      if (resolvedCity) {
        console.log("[v0] Setting search location to:", resolvedCity);
        setSearchLocation(resolvedCity);
      } else {
        console.warn("[v0] No matching market location found for candidates");
      }
      setCurrentPlaceLabel(resolved.label || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
      setLocationError(null);
    },
    [locationOptions]
  );

  const currentEntries = useMemo(() => {
    if (!currentCity) return markets;

    const normalized = currentCity.toLowerCase();
    return markets.filter((entry) =>
      [entry.name, entry.address, entry.city, entry.state, `${entry.city}, ${entry.state}`]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [currentCity, markets]);

  const filteredMarkets = useMemo(() => {
    const normalizedQuery = searchLocation.trim().toLowerCase();
    const cropFiltered = selectedCrop
      ? currentEntries.filter((entry) =>
          entry.products.some((product) =>
            product.toLowerCase().includes(selectedCrop.toLowerCase())
          )
        )
      : currentEntries;

    return cropFiltered.filter((entry) =>
      [entry.name, entry.address, entry.city, entry.state, entry.products.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [currentEntries, searchLocation, selectedCrop]);

  useEffect(() => {
    if (isLoadingMarkets) {
      return;
    }

    if (typeof window === "undefined" || !navigator.geolocation) {
      setTimeout(() => {
        setLocationError(
          translate("location_unavailable", "Current location is unavailable on this device.")
        );
        setIsDetectingLocation(false);
      }, 0);
      return;
    }

    detectCurrentLocation()
      .then((coords) => applyDetectedLocation(coords))
      .catch((error) => {
        setLocationError(getLocationErrorMessage(error));
        setCurrentCity("");
        setSearchLocation("");
        setCurrentPlaceLabel("");
        setUserLocation(null);
        setIsDetectingLocation(false);
      })
      .finally(() => setIsDetectingLocation(false));
  }, [applyDetectedLocation, getLocationErrorMessage, isLoadingMarkets, translate]);

  const handleLocationSearch = (locationOverride?: string) => {
    const query = (locationOverride ?? searchLocation).trim();
    if (!query) return;

    setLoading(true);
    const matchingLocation =
      findBestLocationMatch(query, locationOptions) ||
      markets.find((entry) =>
        [entry.name, entry.address, entry.city, entry.state]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )?.city ||
      "";

    if (matchingLocation) {
      setCurrentCity(matchingLocation);
      setSearchLocation(matchingLocation);
      setLocationError(null);
    } else {
      setLocationError(
        translate("location_not_found", "No nearby markets found for that location.")
      );
    }

    setLoading(false);
  };

  const syncWithCurrentLocation = () => {
    setLoading(true);
    setIsDetectingLocation(true);

    detectCurrentLocation()
      .then((coords) => applyDetectedLocation(coords))
      .catch((error) => {
        setLocationError(getLocationErrorMessage(error));
      })
      .finally(() => {
        setLoading(false);
        setIsDetectingLocation(false);
      });
  };

  const handleDirections = (entry: MarketEntry) => {
    const destination = encodeURIComponent(`${entry.name}, ${entry.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, "_blank");
  };

  const renderEntryCard = (entry: MarketEntry) => (
    <Card key={entry.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="rounded-xl bg-[#16a34a] p-3">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{entry.name}</h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{entry.address}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={entry.active ? "secondary" : "outline"}>
              {entry.active ? translate("open", "Open") : translate("closed", "Closed")}
            </Badge>
            <p className="mt-1 text-xs text-gray-500">
              {translate("latest_report", "Latest report")}: {entry.latestArrivalDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {entry.products.slice(0, 3).map((product) => (
            <Badge key={product} variant="outline" className="capitalize">
              {product}
            </Badge>
          ))}
          {entry.averageModalPrice > 0 && (
            <Badge variant="outline">
              {translate("modal_price", "Modal price")}: ₹{entry.averageModalPrice}
            </Badge>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {entry.city}, {entry.state}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => handleDirections(entry)}>
            <Navigation className="h-4 w-4" />
            {translate("directions", "Directions")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="w-full px-4 pb-24">
      <BackButton />

      <div className="pb-6 pt-8 text-center">
        <div className="mx-auto mb-4 w-fit rounded-full bg-[#16a34a] p-4 shadow-sm">
          <TrendingUp size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          {translate("market_price_viewer", "Market Prices Nearby")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">
          {translate("market_price_desc", "Browse markets from the weekly commodity CSV")}
        </p>
      </div>

      <Card className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#16a34a]" />
              <h2 className="font-semibold text-gray-900">
                {translate("search_by_location", "Search by location")}
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={syncWithCurrentLocation} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {translate("refresh", "Refresh")}
            </Button>
          </div>

          {userLocation && (
            <div className="rounded-xl bg-green-50 p-3 text-sm text-green-900">
              <p className="font-medium">
                {translate("current_location", "Current location")}: {currentCity || "Unknown"}
              </p>
              <p className="text-xs text-green-700">
                {translate("coordinates", "Coordinates")}: {userLocation[0].toFixed(4)},{" "}
                {userLocation[1].toFixed(4)}
              </p>
              {currentPlaceLabel && (
                <p className="text-xs text-green-700">
                  {translate("current_place", "Detected place")}: {currentPlaceLabel}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLocationSearch();
                }}
                placeholder={translate("enter_city_or_area", "Enter market, district, or state")}
                className="h-11 rounded-xl border-gray-200 bg-white pl-10"
              />
            </div>
            <Button onClick={() => handleLocationSearch()} disabled={loading || !searchLocation.trim()}>
              <Search className="h-4 w-4" />
              {translate("search", "Search")}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={syncWithCurrentLocation}
            disabled={isDetectingLocation}
            className="w-full"
          >
            <MapPin className="h-4 w-4" />
            {translate("use_current_location", "Use current location")}
          </Button>

          {isDetectingLocation && (
            <div className="flex items-center gap-2 text-sm text-[#16a34a]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {translate("detecting_location", "Detecting your location...")}
            </div>
          )}

          {currentCity && (
            <p className="text-sm font-medium text-[#166534]">
              {translate("showing_results_for", "Currently showing results for")} {currentCity}
            </p>
          )}

          {locationError && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {locationOptions.slice(0, 8).map((location) => (
              <Button
                key={location}
                variant="outline"
                size="sm"
                onClick={() => handleLocationSearch(location)}
              >
                {location}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sprout className="h-4 w-4 text-[#16a34a]" />
            <h2 className="font-semibold text-gray-900">
              {translate("filter_markets_by_crop", "Filter markets by crop")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {cropOptions.slice(0, 12).map((crop) => (
              <Button
                key={crop}
                size="sm"
                variant={selectedCrop === crop ? "default" : "outline"}
                className="capitalize"
                onClick={() => setSelectedCrop(crop)}
              >
                {formatKey(crop)}
              </Button>
            ))}
            {selectedCrop && (
              <Button size="sm" variant="ghost" onClick={() => setSelectedCrop(null)}>
                {translate("clear_filter", "Clear filter")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex gap-2">
        <Button className="flex-1" disabled>
          <Store className="h-4 w-4" />
          {translate("nearby_markets", "Nearby Markets")}
          <Badge variant="secondary" className="ml-1">
            {filteredMarkets.length}
          </Badge>
        </Button>
      </div>

      <div className="space-y-4">
        {loading || isLoadingMarkets ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#16a34a]" />
          </div>
        ) : filteredMarkets.length > 0 ? (
          filteredMarkets.map(renderEntryCard)
        ) : (
          <Card className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="font-medium text-gray-900">
                {currentCity
                  ? `${translate("no_results_in_city", "No results found in")} ${currentCity}`
                  : translate("no_market_results", "No market rows found in the CSV dataset")}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {translate(
                  "try_different_city_or_filter",
                  "Try a different city or clear the current filter."
                )}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
