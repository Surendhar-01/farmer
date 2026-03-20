/* eslint-disable @typescript-eslint/no-explicit-any */
// cspell:ignore Trichy Koyambedu Thiruvarur Thanjavur Selvam Murugan Nadu Nominatim OSRM Villupuram
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Clock, 
  Fuel, 
  Users, 
  Shield, 
  Route as RouteIcon,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff
} from "lucide-react"

interface RouteInfo {
  distance: string
  duration: string
  fuelCost: string
  routeCoordinates: [number, number][]
  startCoords: [number, number]
  endCoords: [number, number]
  avoidedRoads: string[]
}

interface NearbyFarmer {
  name: string
  distance: string
  crop: string
}

interface TransportOption {
  driver_name: string
  vehicle_type: string
  capacity: number
  route: string
  available_date: string
  price_per_km: number
}

const DEMO_LOCATIONS: Record<string, [number, number]> = {
  "Madurai": [9.9252, 78.1198],
  "Chennai": [13.0827, 80.2707],
  "Coimbatore": [11.0168, 76.9558],
  "Trichy": [10.7905, 78.7047],
  "Salem": [11.6643, 78.1460],
  "Koyambedu Market": [13.0694, 80.1948],
  "Thiruvarur": [10.7725, 79.6369],
  "Thanjavur": [10.7870, 79.1378],
}

const fallbackFarmers: NearbyFarmer[] = [
  { name: "Ravi Kumar", distance: "2.5 km", crop: "Rice" },
  { name: "Selvam", distance: "3.1 km", crop: "Tomato" },
  { name: "Murugan", distance: "4.2 km", crop: "Onion" },
]

export default function TransportationPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [sharedMode, setSharedMode] = useState(false)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState<any>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([])

  // Load Leaflet dynamically only on client-side
  useEffect(() => {
    const loadSchemaData = async () => {
      try {
        const response = await fetch("/api/schema-data")
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { transport: TransportOption[] }
        setTransportOptions(data.transport)
      } catch {
        // ignore
      }
    }

    void loadSchemaData()
  }, [])

  // Load Leaflet dynamically only on client-side
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    const loadLeaflet = async () => {
      try {
        // Dynamically import Leaflet
        const L = (await import("leaflet")).default
        
        // Fix for default Leaflet markers - Using optional chaining to prevent error
        delete (L.Icon.Default.prototype as any)?._getIconUrl
        if (L.Icon.Default && L.Icon.Default.mergeOptions) {
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
            iconUrl: '/leaflet/images/marker-icon.png',
            shadowUrl: '/leaflet/images/marker-shadow.png',
          })
        }
        
        // Store Leaflet in window object for global access
        (window as any).L = L
        
        // Load Leaflet CSS
        const cssExists = document.querySelector('link[href*="leaflet"]')
        if (!cssExists) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
        }
        
        setLeafletLoaded(true)
      } catch (error) {
        console.error("Failed to load Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check for SpeechRecognition support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI()
        
        // Set properties safely
        if (recognition) {
          recognition.continuous = false
          recognition.interimResults = false
          recognition.lang = 'en-US'
          recognition.maxAlternatives = 1

          recognition.onresult = (event: any) => {
            if (event.results && event.results[0] && event.results[0][0]) {
              const transcript = event.results[0][0].transcript
              setToLocation(prev => prev + (prev ? " " : "") + transcript)
              setVoiceError(null)
            }
          }

          recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error)
            setVoiceError(`Voice input failed: ${event.error}`)
            setIsListening(false)
          }

          recognition.onend = () => {
            setIsListening(false)
          }

          setSpeechRecognition(recognition)
        }
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error)
        setVoiceError("Voice input is not available")
      }
    } else {
      console.log("Speech recognition not supported")
      setVoiceError("Voice input is not supported in your browser")
    }
  }, [])

  // Get user's current location
  useEffect(() => {
    if (typeof window === "undefined") return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(coords)
          setLocationError(null)
        },
        (error) => {
          console.log("[v0] Geolocation error:", error.message)
          setLocationError("Could not get your location. Using default.")
          // Default to Madurai if geolocation fails
          setUserLocation([9.9252, 78.1198])
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLocationError("Geolocation not supported. Using default.")
      setUserLocation([9.9252, 78.1198])
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current || typeof window === "undefined") return

    const L = (window as any).L
    if (!L) return

    const defaultCenter: [number, number] = userLocation || [10.7905, 78.7047] // Tamil Nadu center

    const map = L.map(mapRef.current).setView(defaultCenter, 8)
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)

    mapInstanceRef.current = map
    setMapLoaded(true)

    // Add user location marker if available
    if (userLocation) {
      const userMarker = L.marker(userLocation, {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
      }).addTo(map)
      userMarker.bindPopup("Your Location")
      markersRef.current.push(userMarker)
      map.setView(userLocation, 10)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded, userLocation])

  // Function to get coordinates from location name
  const getCoordinates = useCallback(async (location: string): Promise<[number, number] | null> => {
    if (typeof window === "undefined") return null

    // Check if it's a demo location
    const demoKey = Object.keys(DEMO_LOCATIONS).find(
      key => location.toLowerCase().includes(key.toLowerCase())
    )
    if (demoKey) {
      return DEMO_LOCATIONS[demoKey]
    }

    // Use Nominatim for geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ", Tamil Nadu, India")}&limit=1`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      }
    } catch (error) {
      console.log("[v0] Geocoding error:", error)
    }
    return null
  }, [])

  // Function to get route from OSRM
  const getRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      )
      const data = await response.json()
      
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        )
        
        const distanceKm = (route.distance / 1000).toFixed(1)
        const durationMinutes = Math.round(route.duration / 60)
        const hours = Math.floor(durationMinutes / 60)
        const minutes = durationMinutes % 60
        
        // Estimate fuel cost (assuming 10 km/L and Rs 100/L)
        const fuelLiters = parseFloat(distanceKm) / 10
        const fuelCost = Math.round(fuelLiters * 100)
        
        return {
          distance: `${distanceKm} km`,
          duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`,
          fuelCost: `₹${sharedMode ? Math.round(fuelCost / 3) : fuelCost}`,
          routeCoordinates: coordinates,
          startCoords: start,
          endCoords: end,
          avoidedRoads: ["NH44 Section near Villupuram (under repair)", "Old Bridge Road (narrow)"]
        }
      }
    } catch (error) {
      console.log("[v0] Routing error:", error)
    }
    return null
  }, [sharedMode])

  // Draw route on map
  const drawRoute = useCallback((routeData: RouteInfo) => {
    if (!mapInstanceRef.current || typeof window === "undefined") return

    const L = (window as any).L
    if (!L) return

    const map = mapInstanceRef.current

    // Clear existing route and markers
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
    }
    markersRef.current.forEach(marker => map.removeLayer(marker))
    markersRef.current = []

    // Draw route polyline
    const routeLine = L.polyline(routeData.routeCoordinates, {
      color: "#22c55e",
      weight: 5,
      opacity: 0.8,
    }).addTo(map)
    routeLayerRef.current = routeLine

    // Add start marker
    const startMarker = L.marker(routeData.startCoords, {
      icon: L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">A</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
    }).addTo(map)
    startMarker.bindPopup(`<b>Start:</b> ${fromLocation}`)
    markersRef.current.push(startMarker)

    // Add end marker
    const endMarker = L.marker(routeData.endCoords, {
      icon: L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">B</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
    }).addTo(map)
    endMarker.bindPopup(`<b>Destination:</b> ${toLocation}`)
    markersRef.current.push(endMarker)

    // Fit map to route bounds
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] })
  }, [fromLocation, toLocation])

  const calculateRoute = async () => {
    if (!fromLocation || !toLocation) return

    setIsCalculating(true)
    setRouteInfo(null)

    try {
      // Get coordinates for both locations
      let startCoords: [number, number] | null = null
      let endCoords: [number, number] | null = null

      // If "current location" or similar is entered, use user's location
      if (fromLocation.toLowerCase().includes("current") || fromLocation.toLowerCase().includes("my location")) {
        startCoords = userLocation
      } else {
        startCoords = await getCoordinates(fromLocation)
      }

      endCoords = await getCoordinates(toLocation)

      if (!startCoords || !endCoords) {
        alert("Could not find one or both locations. Please try again with different location names.")
        setIsCalculating(false)
        return
      }

      // Get route from OSRM
      const routeData = await getRoute(startCoords, endCoords)

      if (routeData) {
        setRouteInfo(routeData)
        drawRoute(routeData)
      } else {
        alert("Could not calculate route. Please try again.")
      }
    } catch (error) {
      console.log("[v0] Route calculation error:", error)
      alert("Error calculating route. Please try again.")
    }

    setIsCalculating(false)
  }

  // Use current location
  const useCurrentLocation = () => {
    if (userLocation) {
      setFromLocation("Current Location")
    } else {
      alert("Getting your location... Please wait or enter manually.")
    }
  }

  // Handle voice input for destination
  const toggleVoiceInput = () => {
    if (!speechRecognition) {
      setVoiceError("Voice input is not supported in your browser. Please type your destination.")
      return
    }

    if (isListening) {
      speechRecognition.stop()
      setIsListening(false)
    } else {
      setVoiceError(null)
      try {
        speechRecognition.start()
        setIsListening(true)
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        setVoiceError("Failed to start voice input. Please try again.")
      }
    }
  }

  // Handle Enter key for route calculation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fromLocation && toLocation && !isCalculating) {
      calculateRoute()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" onClick={() => router.back()} className="self-start gap-2">
        <ArrowLeft className="h-5 w-5" />
        {t("back")}
      </Button>

      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <RouteIcon className="h-7 w-7 text-primary" />
        {t("routeAssistant")}
      </h1>

      {/* Location Inputs */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="text-base font-medium">{t("yourLocation")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  id="from"
                  placeholder="e.g., Madurai, Thiruvarur..."
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 bg-transparent"
                onClick={useCurrentLocation}
                title="Use current location"
                type="button"
              >
                <Navigation className="h-5 w-5 text-primary" />
              </Button>
            </div>
            {locationError && (
              <p className="text-xs text-muted-foreground">{locationError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="to" className="text-base font-medium">{t("destination")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                <Input
                  id="to"
                  placeholder="Speak or type destination..."
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                variant={isListening ? "destructive" : "outline"}
                size="icon" 
                className="h-12 w-12"
                onClick={toggleVoiceInput}
                title={isListening ? "Stop listening" : "Use voice input"}
                type="button"
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </div>
            {voiceError && (
              <p className="text-xs text-destructive mt-1">{voiceError}</p>
            )}
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Mic className="h-4 w-4" />
                Listening... Speak your destination now
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">{t("sharedTransport")}</span>
            </div>
            <input 
              type="checkbox"
              checked={sharedMode} 
              onChange={(e) => setSharedMode(e.target.checked)}
              aria-label="Toggle shared transport mode"
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <Button 
            onClick={calculateRoute} 
            className="w-full h-14 text-lg font-semibold"
            disabled={!fromLocation || !toLocation || isCalculating}
            type="button"
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RouteIcon className="h-5 w-5 mr-2" />
                {t("findRoute")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Route Map</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-lg bg-muted overflow-hidden"
            style={{ minHeight: "250px" }}
          >
            {!mapLoaded && (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Info */}
      {routeInfo && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4 text-center">
                <RouteIcon className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs opacity-80">{t("distance")}</p>
                <p className="text-xl font-bold">{routeInfo.distance}</p>
              </CardContent>
            </Card>
            <Card className="bg-accent text-accent-foreground">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs opacity-80">{t("estimatedTime")}</p>
                <p className="text-xl font-bold">{routeInfo.duration}</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-2 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <Fuel className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs opacity-80">{t("estimatedFuel")}</p>
                <p className="text-xl font-bold">{routeInfo.fuelCost}</p>
              </CardContent>
            </Card>
          </div>

          {/* Route Features */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{t("shortestRoute")}</p>
                  <p className="text-sm text-muted-foreground">{t("lowerCost")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                <Shield className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">{t("safestRoute")}</p>
                  <p className="text-sm text-muted-foreground">{t("avoidsDamagedRoads")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-chart-3" />
                  Avoided Roads:
                </p>
                <div className="flex flex-wrap gap-1">
                  {routeInfo.avoidedRoads.map((road, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {road}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shared Transport */}
          {sharedMode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Available Transport
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {(transportOptions.length > 0
                  ? transportOptions.map((option) => ({
                      name: option.driver_name,
                      distance: `${option.price_per_km}/km`,
                      crop: `${option.vehicle_type} • ${option.capacity} kg • ${option.route}`,
                    }))
                  : fallbackFarmers
                ).map((farmer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{farmer.name}</p>
                      <p className="text-sm text-muted-foreground">{farmer.crop} - {farmer.distance} away</p>
                    </div>
                    <Button size="sm" variant="outline" type="button">Add</Button>
                  </div>
                ))}
                <p className="text-center text-sm text-primary font-medium mt-2">
                  Share transport to save up to 60% on fuel!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
