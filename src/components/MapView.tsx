"use client";

import dynamic from "next/dynamic";

// Dynamically import Leaflet with no SSR to bypass window missing issues
const MapViewComponent = dynamic(() => import("./LeafletMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
      Loading Map...
    </div>
  ),
});

interface MapViewProps {
  markers?: { lat: number; lng: number; title: string }[];
  destination?: { lat: number; lng: number };
}

export const MapView = (props: MapViewProps) => {
  return <MapViewComponent {...props} />;
};
