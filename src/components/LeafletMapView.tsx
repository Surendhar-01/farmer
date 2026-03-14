"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default marker icon issue in React
interface LeafletDefaultIconPrototype {
  _getIconUrl?: string;
}

interface OsrmRouteResponse {
  routes?: Array<{
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

delete (L.Icon.Default.prototype as LeafletDefaultIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const defaultCenter: [number, number] = [20.5937, 78.9629];

interface MapViewProps {
  markers?: { lat: number; lng: number; title: string }[];
  destination?: { lat: number; lng: number };
}

export default function LeafletMapView({ markers, destination }: MapViewProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(defaultCenter);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.warn("Geolocation denied, using default center.")
      );
    }
  }, []);

  // OSRM Routing logic
  useEffect(() => {
    if (currentLocation !== defaultCenter && destination) {
      // OSRM requires format: {lon},{lat}
      const p1 = `${currentLocation[1]},${currentLocation[0]}`;
      const p2 = `${destination.lng},${destination.lat}`;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${p1};${p2}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then((res) => res.json())
        .then((data: OsrmRouteResponse) => {
          if (data.routes && data.routes.length > 0) {
            // GeoJSON returns [lng, lat], Leaflet wants [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            setRouteCoordinates(coords);
          }
        })
        .catch((err) => console.error("OSRM Routing Error", err));
    }
  }, [currentLocation, destination]);

  // Center logic
  const zoom = markers?.length ? 12 : 5;
  const center = markers && markers.length > 0 ? [markers[0].lat, markers[0].lng] : currentLocation;

  return (
    <div className="w-full h-[250px] shadow-inner rounded-2xl overflow-hidden border border-gray-200 z-0 relative">
      <MapContainer
        center={center as [number, number]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Farmer Location */}
        <Marker position={currentLocation}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Pinned Locations */}
        {markers?.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lng]}>
            <Popup>{marker.title}</Popup>
          </Marker>
        ))}

        {/* Dynamic Drawn Route */}
        {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="blue" weight={4} />}
      </MapContainer>
    </div>
  );
}
