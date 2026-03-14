"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Factory,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  Sprout,
  Store,
  TrendingUp,
} from "lucide-react";

type MarketType = "market" | "factory" | "mandi";
type ActiveTab = "markets" | "factories";

interface MarketEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  products: string[];
  contact: string;
  type: MarketType;
  openingHours: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  rating?: number;
  active: boolean;
}

const TAMIL_NADU_MARKETS: Record<string, MarketEntry[]> = {
  Chennai: [
    {
      id: "chn-1",
      name: "Koyambedu Wholesale Market Complex",
      address: "Koyambedu, Chennai, Tamil Nadu",
      city: "Chennai",
      products: ["vegetables", "fruits", "flowers", "tomato", "onion"],
      contact: "+91 44 2479 2321",
      type: "market",
      openingHours: "24/7",
      distanceKm: 0,
      latitude: 13.0694,
      longitude: 80.1948,
      rating: 4.5,
      active: true,
    },
    {
      id: "chn-2",
      name: "Madhavaram Fruit Market",
      address: "Madhavaram, Chennai, Tamil Nadu",
      city: "Chennai",
      products: ["fruits", "vegetables", "tomato", "cabbage"],
      contact: "+91 44 2555 6789",
      type: "market",
      openingHours: "04:00 AM - 10:00 PM",
      distanceKm: 15,
      latitude: 13.1484,
      longitude: 80.2314,
      rating: 4.2,
      active: true,
    },
    {
      id: "chn-3",
      name: "Chennai Agro Processing Unit",
      address: "Ambattur Industrial Estate, Chennai",
      city: "Chennai",
      products: ["rice", "wheat", "pulses", "grains"],
      contact: "+91 44 2625 4321",
      type: "factory",
      openingHours: "08:00 AM - 06:00 PM",
      distanceKm: 20,
      latitude: 13.115,
      longitude: 80.1548,
      rating: 4,
      active: true,
    },
  ],
  Coimbatore: [
    {
      id: "cbe-1",
      name: "Coimbatore Vegetable Market",
      address: "Town Hall, Coimbatore, Tamil Nadu",
      city: "Coimbatore",
      products: ["vegetables", "fruits", "tomato", "onion", "cabbage"],
      contact: "+91 422 239 1122",
      type: "market",
      openingHours: "05:00 AM - 09:00 PM",
      distanceKm: 0,
      latitude: 11.0168,
      longitude: 76.9558,
      rating: 4.3,
      active: true,
    },
    {
      id: "cbe-2",
      name: "Gandhipuram Wholesale Market",
      address: "Gandhipuram, Coimbatore, Tamil Nadu",
      city: "Coimbatore",
      products: ["vegetables", "fruits", "grains", "rice", "tomato"],
      contact: "+91 422 245 6789",
      type: "market",
      openingHours: "04:00 AM - 11:00 PM",
      distanceKm: 3,
      latitude: 11.0086,
      longitude: 76.9679,
      rating: 4.4,
      active: true,
    },
    {
      id: "cbe-3",
      name: "Coimbatore Agro Processing Unit",
      address: "SIDCO Industrial Estate, Coimbatore",
      city: "Coimbatore",
      products: ["rice", "wheat", "pulses", "grains"],
      contact: "+91 422 267 8901",
      type: "factory",
      openingHours: "08:00 AM - 06:00 PM",
      distanceKm: 8,
      latitude: 11.0276,
      longitude: 76.9345,
      rating: 4.1,
      active: true,
    },
    {
      id: "cbe-4",
      name: "Peelamedu Vegetable Processing",
      address: "Peelamedu, Coimbatore",
      city: "Coimbatore",
      products: ["tomato", "onion", "potato", "cabbage"],
      contact: "+91 422 256 7890",
      type: "factory",
      openingHours: "07:00 AM - 07:00 PM",
      distanceKm: 5,
      latitude: 11.0389,
      longitude: 76.999,
      rating: 4.2,
      active: true,
    },
  ],
  Madurai: [
    {
      id: "mdu-1",
      name: "Madurai Vegetable Market",
      address: "Periyar Bus Stand, Madurai, Tamil Nadu",
      city: "Madurai",
      products: ["vegetables", "fruits", "tomato", "onion", "cabbage"],
      contact: "+91 452 234 5678",
      type: "market",
      openingHours: "04:00 AM - 10:00 PM",
      distanceKm: 0,
      latitude: 9.9252,
      longitude: 78.1198,
      rating: 4.2,
      active: true,
    },
    {
      id: "mdu-2",
      name: "Uzhavar Santhai",
      address: "Multiple locations, Madurai",
      city: "Madurai",
      products: ["vegetables", "fruits", "organics", "tomato", "onion"],
      contact: "+91 452 245 6789",
      type: "mandi",
      openingHours: "06:00 AM - 08:00 PM",
      distanceKm: 2,
      latitude: 9.939,
      longitude: 78.121,
      rating: 4.5,
      active: true,
    },
    {
      id: "mdu-3",
      name: "Madurai Rice Mill",
      address: "Koodal Nagar, Madurai",
      city: "Madurai",
      products: ["rice", "grains"],
      contact: "+91 452 267 8901",
      type: "factory",
      openingHours: "08:00 AM - 06:00 PM",
      distanceKm: 4,
      latitude: 9.945,
      longitude: 78.13,
      rating: 4.3,
      active: true,
    },
  ],
  Salem: [
    {
      id: "slm-1",
      name: "Salem Vegetable Market",
      address: "Fort, Salem, Tamil Nadu",
      city: "Salem",
      products: ["vegetables", "fruits", "tomato", "onion", "potato"],
      contact: "+91 427 244 1234",
      type: "market",
      openingHours: "05:00 AM - 09:00 PM",
      distanceKm: 0,
      latitude: 11.6643,
      longitude: 78.146,
      rating: 4,
      active: true,
    },
    {
      id: "slm-2",
      name: "Salem Mango Processing Unit",
      address: "Shevapet, Salem",
      city: "Salem",
      products: ["fruits", "mango", "tomato"],
      contact: "+91 427 255 6789",
      type: "factory",
      openingHours: "07:00 AM - 05:00 PM",
      distanceKm: 3,
      latitude: 11.67,
      longitude: 78.15,
      rating: 4.1,
      active: true,
    },
  ],
  Trichy: [
    {
      id: "try-1",
      name: "Trichy Central Market",
      address: "Chatram Bus Stand, Trichy, Tamil Nadu",
      city: "Trichy",
      products: ["vegetables", "fruits", "flowers", "tomato", "onion"],
      contact: "+91 431 271 2345",
      type: "market",
      openingHours: "04:00 AM - 10:00 PM",
      distanceKm: 0,
      latitude: 10.7905,
      longitude: 78.7047,
      rating: 4.1,
      active: true,
    },
    {
      id: "try-2",
      name: "Trichy Rice Processing Center",
      address: "Srirangam, Trichy",
      city: "Trichy",
      products: ["rice", "grains"],
      contact: "+91 431 282 3456",
      type: "factory",
      openingHours: "08:00 AM - 06:00 PM",
      distanceKm: 6,
      latitude: 10.863,
      longitude: 78.691,
      rating: 4.2,
      active: true,
    },
  ],
};

const CITY_COORDINATES: Record<string, [number, number]> = {
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Salem: [11.6643, 78.146],
  Trichy: [10.7905, 78.7047],
};

const CROP_OPTIONS = [
  "rice",
  "tomato",
  "onion",
  "potato",
  "cabbage",
  "vegetables",
  "fruits",
  "grains",
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c);
}

function findNearestCity(lat: number, lng: number) {
  let nearestCity = Object.keys(CITY_COORDINATES)[0] ?? "";
  let shortestDistance = Number.POSITIVE_INFINITY;

  Object.entries(CITY_COORDINATES).forEach(([city, [cityLat, cityLng]]) => {
    const distance = calculateDistance(lat, lng, cityLat, cityLng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestCity = city;
    }
  });

  return nearestCity;
}

function formatKey(key: string) {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getMarketTranslationKey(id: string, field: "name" | "address") {
  return `market_${id.replace(/-/g, "_")}_${field}`;
}

const detectCurrentLocation = () =>
  new Promise<[number, number]>((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve([position.coords.latitude, position.coords.longitude]),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  });

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data?.address ?? {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "";
    const label =
      [address.suburb, city, address.state].filter(Boolean).join(", ") ||
      data?.display_name ||
      "";

    return { city, label };
  } catch {
    return null;
  }
};

export default function MarketPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>("markets");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState("");
  const [currentPlaceLabel, setCurrentPlaceLabel] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  const translate = useCallback((key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  }, [t]);

  const getLocationErrorMessage = useCallback((error?: GeolocationPositionError | Error) => {
    if (!error || !("code" in error)) {
      return translate(
        "location_fetch_failed",
        "Could not refresh your current location."
      );
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
        return translate(
          "location_fetch_failed",
          "Could not refresh your current location."
        );
    }
  }, [translate]);

  const applyDetectedLocation = useCallback(async (coords: [number, number]) => {
    const resolved = await reverseGeocode(coords[0], coords[1]);
    const fallbackCity = findNearestCity(coords[0], coords[1]);
    const resolvedCity = resolved?.city
      ? Object.keys(TAMIL_NADU_MARKETS).find(
          (city) => city.toLowerCase() === resolved.city.toLowerCase()
        ) || fallbackCity
      : fallbackCity;

    setUserLocation(coords);
    setCurrentCity(resolvedCity);
    setSearchLocation(resolvedCity);
    setCurrentPlaceLabel(resolved?.label || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
    setLocationError(null);
  }, []);

  const allEntries = useMemo(() => Object.values(TAMIL_NADU_MARKETS).flat(), []);

  const currentEntries = useMemo(() => {
    if (!currentCity) return [];

    const entries = TAMIL_NADU_MARKETS[currentCity] ?? [];
    if (!userLocation) return entries;

    return entries
      .map((entry) => ({
        ...entry,
        distanceKm: calculateDistance(
          userLocation[0],
          userLocation[1],
          entry.latitude,
          entry.longitude
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [currentCity, userLocation]);

  const filteredMarkets = useMemo(() => {
    const query = searchLocation.trim().toLowerCase();
    const tabFiltered = currentEntries.filter((entry) =>
      activeTab === "markets"
        ? entry.type === "market" || entry.type === "mandi"
        : entry.type === "factory"
    );

    const cropFiltered =
      activeTab === "factories" && selectedCrop
        ? tabFiltered.filter((entry) =>
            entry.products.some((product) =>
              product.toLowerCase().includes(selectedCrop.toLowerCase())
            )
          )
        : tabFiltered;

    if (!query) return cropFiltered;

    return cropFiltered.filter((entry) =>
      [
        translate(getMarketTranslationKey(entry.id, "name"), entry.name),
        translate(getMarketTranslationKey(entry.id, "address"), entry.address),
        translate(`city_${entry.city.toLowerCase()}`, entry.city),
        entry.products.map((product) => translate(product, product)).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [activeTab, currentEntries, searchLocation, selectedCrop, translate]);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setTimeout(() => {
        setLocationError(
          translate(
            "location_unavailable",
            "Current location is unavailable on this device."
          )
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
  }, [applyDetectedLocation, getLocationErrorMessage, translate]);

  const handleLocationSearch = (cityOverride?: string) => {
    const query = (cityOverride ?? searchLocation).trim();
    if (!query) return;

    setLoading(true);
    const normalizedQuery = query.toLowerCase();
    const matchingCity =
      Object.keys(TAMIL_NADU_MARKETS).find(
        (city) =>
          city.toLowerCase() === normalizedQuery ||
          city.toLowerCase().includes(normalizedQuery) ||
          normalizedQuery.includes(city.toLowerCase())
      ) ??
      allEntries.find((entry) =>
        [
          translate(getMarketTranslationKey(entry.id, "name"), entry.name),
          translate(getMarketTranslationKey(entry.id, "address"), entry.address),
          translate(`city_${entry.city.toLowerCase()}`, entry.city),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )?.city;

    if (matchingCity) {
      setCurrentCity(matchingCity);
      setSearchLocation(matchingCity);
      setLocationError(null);
    } else {
      setLocationError(
        translate(
          "location_not_found",
          "No nearby markets or factories found for that location."
        )
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

  const handleCall = (phone: string) => {
    window.location.assign(`tel:${phone}`);
  };

  const handleDirections = (lat: number, lng: number, name: string) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_name=${encodeURIComponent(name)}`,
      "_blank"
    );
  };

  const renderEntryCard = (entry: MarketEntry) => (
    <Card key={entry.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="rounded-xl bg-[#16a34a] p-3">
              {entry.type === "factory" ? (
                <Factory className="h-5 w-5 text-white" />
              ) : (
                <Store className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {translate(getMarketTranslationKey(entry.id, "name"), entry.name)}
              </h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {translate(getMarketTranslationKey(entry.id, "address"), entry.address)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={entry.active ? "secondary" : "outline"}>
              {entry.active ? translate("open", "Open") : translate("closed", "Closed")}
            </Badge>
            <p className="mt-1 text-xs text-gray-500">
              {entry.distanceKm} {translate("km_away", "km away")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {typeof entry.rating === "number" && (
            <Badge variant="outline">{"⭐ " + entry.rating.toFixed(1)}</Badge>
          )}
          {entry.products.slice(0, 3).map((product) => (
            <Badge key={product} variant="outline" className="capitalize">
              {translate(product, formatKey(product))}
            </Badge>
          ))}
        </div>

        <div className="text-sm text-gray-600">{entry.openingHours}</div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => handleCall(entry.contact)}>
            <Phone className="h-4 w-4" />
            {translate("call", "Call")}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              handleDirections(
                entry.latitude,
                entry.longitude,
                translate(getMarketTranslationKey(entry.id, "name"), entry.name)
              )
            }
          >
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

      <div className="pt-8 pb-6 text-center">
        <div className="mx-auto mb-4 w-fit rounded-full bg-[#16a34a] p-4 shadow-sm">
          <TrendingUp size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          {translate("market_price_viewer", "Markets and Factories Nearby")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">
          {translate("market_price_desc", "Find markets and factories nearby")}
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
                {translate("current_location", "Current location")}:{" "}
                {translate(`city_${currentCity.toLowerCase()}`, currentCity)}
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
                placeholder={translate("enter_city_or_area", "Enter city or area")}
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
              {translate("showing_results_for", "Currently showing results for")}{" "}
              {translate(`city_${currentCity.toLowerCase()}`, currentCity)}
            </p>
          )}

          {locationError && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {Object.keys(TAMIL_NADU_MARKETS).map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                onClick={() => handleLocationSearch(city)}
              >
                {translate(`city_${city.toLowerCase()}`, city)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTab === "markets" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setActiveTab("markets")}
        >
          <Store className="h-4 w-4" />
          {translate("nearby_markets", "Nearby Markets")}
          <Badge variant="secondary" className="ml-1">
            {
              currentEntries.filter(
                (entry) => entry.type === "market" || entry.type === "mandi"
              ).length
            }
          </Badge>
        </Button>
        <Button
          variant={activeTab === "factories" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setActiveTab("factories")}
        >
          <Factory className="h-4 w-4" />
          {translate("nearby_factories", "Nearby Factories")}
          <Badge variant="secondary" className="ml-1">
            {currentEntries.filter((entry) => entry.type === "factory").length}
          </Badge>
        </Button>
      </div>

      {activeTab === "factories" && (
        <Card className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sprout className="h-4 w-4 text-[#16a34a]" />
              <h2 className="font-semibold text-gray-900">
                {translate("filter_factories_by_crop", "Filter factories by crop")}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CROP_OPTIONS.map((crop) => (
                <Button
                  key={crop}
                  size="sm"
                  variant={selectedCrop === crop ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => setSelectedCrop(crop)}
                >
                  {translate(crop, formatKey(crop))}
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
      )}

      <div className="space-y-4">
        {loading ? (
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
                {activeTab === "factories" && selectedCrop
                  ? `${translate("no_factories_processing", "No factories processing this crop in")} ${translate(`city_${currentCity.toLowerCase()}`, currentCity)}`
                  : `${translate("no_results_in_city", "No results found in")} ${translate(`city_${currentCity.toLowerCase()}`, currentCity)}`}
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
