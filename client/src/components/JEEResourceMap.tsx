import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BookOpen, Users, Zap } from "lucide-react";
import { usePersistFn } from "@/hooks/usePersistFn";

interface ResourceMarker {
  id: number;
  name: string;
  type: "coaching" | "library" | "mcq" | "mocktest";
  lat: number;
  lng: number;
  address: string;
  rating: number;
  description: string;
  icon: string;
}

const RESOURCE_MARKERS: ResourceMarker[] = [
  {
    id: 1,
    name: "JEE Coaching Center - Delhi",
    type: "coaching",
    lat: 28.7041,
    lng: 77.1025,
    address: "New Delhi, India",
    rating: 4.8,
    description: "Premier JEE coaching with experienced faculty",
    icon: "📚",
  },
  {
    id: 2,
    name: "Physics Lab - Mumbai",
    type: "library",
    lat: 19.0760,
    lng: 72.8777,
    address: "Mumbai, India",
    rating: 4.6,
    description: "Advanced physics lab with experiments",
    icon: "🔬",
  },
  {
    id: 3,
    name: "MCQ Practice Center - Bangalore",
    type: "mcq",
    lat: 12.9716,
    lng: 77.5946,
    address: "Bangalore, India",
    rating: 4.7,
    description: "Online and offline MCQ practice sessions",
    icon: "✏️",
  },
  {
    id: 4,
    name: "Mock Test Center - Hyderabad",
    type: "mocktest",
    lat: 17.3850,
    lng: 78.4867,
    address: "Hyderabad, India",
    rating: 4.9,
    description: "Full-length JEE mock tests with analysis",
    icon: "📊",
  },
  {
    id: 5,
    name: "Chemistry Study Group - Chennai",
    type: "library",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, India",
    rating: 4.5,
    description: "Collaborative chemistry study sessions",
    icon: "⚗️",
  },
  {
    id: 6,
    name: "Mathematics Problem Solving - Pune",
    type: "coaching",
    lat: 18.5204,
    lng: 73.8567,
    address: "Pune, India",
    rating: 4.7,
    description: "Advanced mathematics problem-solving workshops",
    icon: "🧮",
  },
];

interface JEEResourceMapProps {
  height?: string;
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise<void>((resolve) => {
    if ((window as any).google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      resolve();
    };
    document.head.appendChild(script);
  });
}

export default function JEEResourceMap({ height = "h-96" }: JEEResourceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<ResourceMarker | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [mapLoaded, setMapLoaded] = useState(false);

  const initMap = usePersistFn(async () => {
    await loadMapScript();
    if (!mapContainer.current || !window.google) {
      return;
    }

    const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: 5,
      center: defaultCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
      styles: [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
      ],
    });

    setMapLoaded(true);
  });

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    // Add new markers based on filter
    const filteredMarkers =
      selectedType === "all"
        ? RESOURCE_MARKERS
        : RESOURCE_MARKERS.filter((m) => m.type === selectedType);

    filteredMarkers.forEach((marker) => {
      const gMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: map.current,
        title: marker.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getMarkerColor(marker.type),
          fillOpacity: 0.8,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      gMarker.addListener("click", () => {
        setSelectedMarker(marker);
      });

      markers.current.push(gMarker);
    });
  }, [selectedType, mapLoaded]);

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case "coaching":
        return "#3b82f6"; // Blue
      case "library":
        return "#10b981"; // Green
      case "mcq":
        return "#f59e0b"; // Amber
      case "mocktest":
        return "#ef4444"; // Red
      default:
        return "#6366f1"; // Indigo
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "coaching":
        return "📚";
      case "library":
        return "📖";
      case "mcq":
        return "✏️";
      case "mocktest":
        return "📊";
      default:
        return "📍";
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "coaching":
        return "Coaching Centers";
      case "library":
        return "Libraries & Labs";
      case "mcq":
        return "MCQ Practice";
      case "mocktest":
        return "Mock Tests";
      default:
        return "All Resources";
    }
  };

  return (
    <div className="space-y-4">
      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedType === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          All Resources
        </button>
        {["coaching", "library", "mcq", "mocktest"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              selectedType === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span>{getTypeIcon(type)}</span>
            {getTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden shadow-lg">
        <div ref={mapContainer} className={`w-full ${height} bg-gray-100`} />
      </Card>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <Card className="bg-white shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">{selectedMarker.icon}</span>
                {selectedMarker.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {selectedMarker.address}
              </p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              ⭐ {selectedMarker.rating.toFixed(1)}
            </Badge>
          </div>

          <p className="text-gray-700 mb-4">{selectedMarker.description}</p>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all">
              View Details
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-all">
              Get Directions
            </button>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Map Legend</h4>
        <div className="grid grid-cols-2 gap-3">
          {["coaching", "library", "mcq", "mocktest"].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getMarkerColor(type) }}
              />
              <span className="text-sm text-gray-700">{getTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
