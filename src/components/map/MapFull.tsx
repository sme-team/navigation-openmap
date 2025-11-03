// file: src/components/ImprovedMap.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import { Icon } from "leaflet";
import {
  Search,
  Navigation,
  X,
  MapPin,
  Route as RouteIcon,
  Loader,
  Clock,
  Ruler,
  Navigation2,
  Trash2,
} from "lucide-react";

// Import CSS (in your actual project)
import "leaflet/dist/leaflet.css";
import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.MAP);

// Fix Leaflet default icon
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const startIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiMxMGI5ODEiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const endIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiNlZjQ0NDQiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Location {
  lat: number;
  lon: number;
  display_name: string;
  name?: string;
  address?: any;
}

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  instructions: Array<{
    text: string;
    distance: number;
    duration: number;
  }>;
}

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

interface MapProps {
  query?: string;
}

export default function ImprovedMap({ query }: MapProps) {
  logger.trace("ImprovedMap component initialized", { query });

  // Map states
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    16.0544, 108.2022,
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Routing states
  const [startPoint, setStartPoint] = useState<Location | null>(null);
  const [endPoint, setEndPoint] = useState<Location | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingMode, setRoutingMode] = useState(false);

  // Input field states
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null);

  // Current location
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced search with multiple providers
  const searchLocation = useCallback(async (query: string) => {
    logger.trace("Starting location search for query:", query);
    if (!query || query.length < 3) {
      logger.debug("Query too short, clearing results");
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use Nominatim with better parameters for Vietnamese addresses
      logger.debug("Fetching from Nominatim");
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: query,
            format: "json",
            addressdetails: "1",
            limit: "8",
            countrycodes: "vn",
            "accept-language": "vi",
          })
      );

      const nominatimData = await nominatimResponse.json();
      logger.debug("Nominatim returned", nominatimData.length, "results");

      // Also try Photon API for better Vietnamese address coverage
      logger.debug("Fetching from Photon");
      const photonResponse = await fetch(
        `https://photon.komoot.io/api/?` +
          new URLSearchParams({
            q: query,
            limit: "5",
            lang: "vi",
            lon: "108.2022",
            lat: "16.0544",
          })
      );

      const photonData = await photonResponse.json();
      logger.debug(
        "Photon returned",
        photonData.features?.length || 0,
        "results"
      );

      // Combine and deduplicate results
      const combinedResults: Location[] = [];
      const seen = new Set<string>();

      // Process Nominatim results
      nominatimData.forEach((item: any) => {
        const key = `${item.lat}-${item.lon}`;
        if (!seen.has(key)) {
          seen.add(key);
          combinedResults.push({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            name: item.name || item.display_name.split(",")[0],
            address: item.address,
          });
        }
      });

      // Process Photon results
      photonData.features?.forEach((feature: any) => {
        const coords = feature.geometry.coordinates;
        const key = `${coords[1]}-${coords[0]}`;
        if (!seen.has(key)) {
          seen.add(key);
          const props = feature.properties;
          const name = props.name || props.street || props.city;
          const parts = [
            props.name,
            props.street,
            props.housenumber,
            props.city,
            props.state,
          ].filter(Boolean);

          combinedResults.push({
            lat: coords[1],
            lon: coords[0],
            display_name: parts.join(", "),
            name: name,
            address: props,
          });
        }
      });

      logger.trace(
        "Search completed, combined",
        combinedResults.length,
        "unique results"
      );
      setSearchResults(combinedResults);

      logger.debug("results", combinedResults);

      setShowResults(true);
    } catch (error) {
      logger.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    logger.debug(
      "Debounced search effect triggered with activeInput:",
      activeInput
    );
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query =
      activeInput === "start"
        ? startInput
        : activeInput === "end"
        ? endInput
        : searchQuery;

    if (query) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(query);
      }, 400);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [startInput, endInput, searchQuery, activeInput, searchLocation]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    logger.trace("Getting current location");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          logger.debug("Current location obtained:", loc);
          setCurrentLocation(loc);
          setMapCenter(loc);
          setMapZoom(15);

          // Reverse geocode to get address
          logger.debug("Starting reverse geocoding for location:", loc);
          fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
              new URLSearchParams({
                lat: loc[0].toString(),
                lon: loc[1].toString(),
                format: "json",
                addressdetails: "1",
                "accept-language": "vi",
              })
          )
            .then((res) => res.json())
            .then((data) => {
              logger.debug("Reverse geocoding successful:", data.display_name);
              if (routingMode && !startPoint) {
                setStartPoint({
                  lat: loc[0],
                  lon: loc[1],
                  display_name: data.display_name || "Vị trí hiện tại",
                  name: "Vị trí của bạn",
                  address: data.address,
                });
                setStartInput(data.display_name || "Vị trí hiện tại");
              }
            })
            .catch((err) => {
              logger.error("Reverse geocode error:", err);
            });
        },
        (error) => {
          logger.error("Location error:", error);
          alert(
            "Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí."
          );
        }
      );
    } else {
      logger.warn("Browser does not support Geolocation");
      alert("Trình duyệt của bạn không hỗ trợ Geolocation.");
    }
  }, [routingMode, startPoint]);

  // Select location from search results
  const selectLocation = useCallback(
    (location: Location) => {
      logger.trace(
        "Selecting location:",
        location.name || location.display_name
      );
      if (routingMode) {
        if (activeInput === "start" || (!startPoint && !activeInput)) {
          setStartPoint(location);
          setStartInput(location.name || location.display_name.split(",")[0]);
          setActiveInput(null);
        } else if (activeInput === "end" || (startPoint && !endPoint)) {
          setEndPoint(location);
          setEndInput(location.name || location.display_name.split(",")[0]);
          setActiveInput(null);
        }
      } else {
        setMapCenter([location.lat, location.lon]);
        setMapZoom(16);
        setSearchQuery("");
      }

      setShowResults(false);
      setSearchResults([]);
    },
    [routingMode, startPoint, endPoint, activeInput]
  );

  // Calculate route using OSRM
  const calculateRoute = useCallback(async () => {
    if (!startPoint || !endPoint) {
      logger.debug("Cannot calculate route: missing start or end point");
      return;
    }

    logger.trace(
      "Starting route calculation from",
      startPoint.name,
      "to",
      endPoint.name
    );
    setIsRouting(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startPoint.lon},${startPoint.lat};${endPoint.lon},${endPoint.lat}?` +
          new URLSearchParams({
            overview: "full",
            geometries: "geojson",
            steps: "true",
            alternatives: "false",
          })
      );

      const data = await response.json();
      logger.debug(
        "OSRM response code:",
        data.code,
        "routes count:",
        data.routes?.length
      );

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]] as [number, number]
        );

        const instructions = route.legs[0].steps.map((step: any) => ({
          text:
            step.maneuver.instruction || getManeuverText(step.maneuver.type),
          distance: step.distance,
          duration: step.duration,
        }));

        const newRouteData = {
          coordinates,
          distance: route.distance,
          duration: route.duration,
          instructions,
        };
        logger.trace(
          "Route calculated successfully:",
          newRouteData.distance,
          "meters,",
          newRouteData.duration,
          "seconds"
        );
        setRouteData(newRouteData);

        // Fit map to route bounds
        if (coordinates.length > 0) {
          const lats = coordinates.map((c) => c[0]);
          const lons = coordinates.map((c) => c[1]);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
          setMapCenter([centerLat, centerLon]);

          // Calculate appropriate zoom level
          const latDiff = Math.max(...lats) - Math.min(...lats);
          const lonDiff = Math.max(...lons) - Math.min(...lons);
          const maxDiff = Math.max(latDiff, lonDiff);
          const zoom =
            maxDiff > 0.5 ? 10 : maxDiff > 0.1 ? 12 : maxDiff > 0.05 ? 13 : 14;
          setMapZoom(zoom);
        }
      } else {
        logger.warn("No valid route found in OSRM response");
        alert("Không tìm thấy đường đi. Vui lòng thử lại với địa điểm khác.");
      }
    } catch (error) {
      logger.error("Route calculation error:", error);
      alert("Không thể tính toán đường đi. Vui lòng thử lại.");
    } finally {
      setIsRouting(false);
    }
  }, [startPoint, endPoint]);

  // Helper function for maneuver text
  const getManeuverText = (type: string): string => {
    const maneuverMap: Record<string, string> = {
      turn: "Rẽ",
      "new name": "Tiếp tục trên đường",
      depart: "Bắt đầu",
      arrive: "Đến nơi",
      merge: "Nhập làn",
      "on ramp": "Lên đường cao tốc",
      "off ramp": "Xuống đường cao tốc",
      fork: "Đi theo nhánh",
      "end of road": "Cuối đường",
      continue: "Tiếp tục",
      roundabout: "Vào vòng xuyến",
      rotary: "Vào vòng xoay",
      "roundabout turn": "Rẽ tại vòng xuyến",
    };
    return maneuverMap[type] || type;
  };

  // Reset routing
  const resetRouting = useCallback(() => {
    logger.trace("Resetting routing mode");
    setStartPoint(null);
    setEndPoint(null);
    setRouteData(null);
    setRoutingMode(false);
    setStartInput("");
    setEndInput("");
    setActiveInput(null);
  }, []);

  // Swap start and end points
  const swapPoints = useCallback(() => {
    logger.trace("Swapping start and end points");
    const tempPoint = startPoint;
    const tempInput = startInput;

    setStartPoint(endPoint);
    setEndPoint(tempPoint);
    setStartInput(endInput);
    setEndInput(tempInput);
    setRouteData(null);
  }, [startPoint, endPoint, startInput, endInput]);

  // Format helpers
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  // Auto calculate route
  useEffect(() => {
    logger.debug(
      "Auto-route effect: startPoint",
      !!startPoint,
      "endPoint",
      !!endPoint
    );
    if (startPoint && endPoint) {
      calculateRoute();
    }
  }, [startPoint, endPoint, calculateRoute]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      logger.trace("ImprovedMap component unmounting");
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {/* Search/Routing Panel */}
      <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-blue-200">
          <div className="p-4">
            {!routingMode ? (
              // Simple Search Mode
              <>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowResults(true)
                    }
                    placeholder="Tìm kiếm địa điểm (VD: 586 Nguyễn Hữu Thọ, Đà Nẵng)..."
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-blue-200 
                             bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                  {isSearching && (
                    <Loader
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 animate-spin"
                      size={20}
                    />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setShowResults(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Navigation size={18} />
                    <span className="text-sm font-medium">Vị trí của tôi</span>
                  </button>

                  <button
                    onClick={() => setRoutingMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <RouteIcon size={18} />
                    <span className="text-sm font-medium">Chỉ đường</span>
                  </button>
                </div>
              </>
            ) : (
              // Routing Mode
              <>
                <div className="space-y-3">
                  {/* Start Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={startInput}
                      onChange={(e) => {
                        setStartInput(e.target.value);
                        setActiveInput("start");
                      }}
                      onFocus={() => {
                        setActiveInput("start");
                        if (searchResults.length > 0) setShowResults(true);
                      }}
                      placeholder="Điểm xuất phát..."
                      className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-green-300 
                               bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
                    {startInput && (
                      <button
                        onClick={() => {
                          setStartPoint(null);
                          setStartInput("");
                          setRouteData(null);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-red-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Swap Button */}
                  {startPoint && endPoint && (
                    <button
                      onClick={swapPoints}
                      className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 z-10 
                               bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    >
                      <Navigation2 size={16} />
                    </button>
                  )}

                  {/* End Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={endInput}
                      onChange={(e) => {
                        setEndInput(e.target.value);
                        setActiveInput("end");
                      }}
                      onFocus={() => {
                        setActiveInput("end");
                        if (searchResults.length > 0) setShowResults(true);
                      }}
                      placeholder="Điểm đến..."
                      className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-red-300 
                               bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-red-500" />
                    {endInput && (
                      <button
                        onClick={() => {
                          setEndPoint(null);
                          setEndInput("");
                          setRouteData(null);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-red-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Navigation size={16} />
                    Vị trí
                  </button>

                  <button
                    onClick={resetRouting}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm ml-auto"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="border-t border-blue-200 max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectLocation(result)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-blue-600 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {result.name || result.display_name.split(",")[0]}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {result.display_name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Route Info Panel - Desktop */}
      {routeData && (
        <div className="absolute top-4 right-4 z-[1000] max-w-sm hidden md:block">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Thông tin lộ trình
              </h3>
              <button
                onClick={resetRouting}
                className="text-red-600 hover:text-red-700 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Ruler className="text-blue-600" size={20} />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDistance(routeData.distance)}
                  </div>
                  <div className="text-xs text-gray-600">Khoảng cách</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="text-blue-600" size={20} />
                <div>
                  <div className="text-xl font-semibold text-gray-700">
                    {formatDuration(routeData.duration)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Thời gian ước tính
                  </div>
                </div>
              </div>
            </div>

            {routeData.instructions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <RouteIcon size={16} />
                  Hướng dẫn đường đi
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {routeData.instructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p>{instruction.text}</p>
                        <p className="text-gray-500 mt-1">
                          {formatDistance(instruction.distance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Info - Mobile Bottom Sheet */}
      {routeData && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] md:hidden">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="text-blue-600" size={16} />
                  <span className="text-xs text-gray-600">Khoảng cách</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {formatDistance(routeData.distance)}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="text-blue-600" size={16} />
                  <span className="text-xs text-gray-600">Thời gian</span>
                </div>
                <div className="text-lg font-bold text-gray-700">
                  {formatDuration(routeData.duration)}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const instructions = document.querySelector(
                  ".mobile-instructions"
                );
                if (instructions) {
                  instructions.classList.toggle("hidden");
                }
              }}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Xem hướng dẫn chi tiết
            </button>

            <div className="mobile-instructions hidden mt-3 max-h-40 overflow-y-auto space-y-2">
              {routeData.instructions.slice(0, 10).map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p>{instruction.text}</p>
                    <p className="text-gray-500 mt-1">
                      {formatDistance(instruction.distance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isRouting && (
        <div className="absolute inset-0 bg-black/20 z-[999] flex items-center justify-center">
          <div className="bg-white/95 rounded-xl shadow-lg p-6 flex items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">
              Đang tính toán đường đi...
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={defaultIcon}>
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-base mb-1">Vị trí của bạn</h3>
                <p className="text-xs text-gray-600">
                  {currentLocation[0].toFixed(6)},{" "}
                  {currentLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Start Point Marker */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lon]} icon={startIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-base text-green-600 mb-1">
                  Điểm xuất phát
                </h3>
                <p className="text-sm">
                  {startPoint.name || startPoint.display_name}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End Point Marker */}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lon]} icon={endIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-base text-red-600 mb-1">
                  Điểm đến
                </h3>
                <p className="text-sm">
                  {endPoint.name || endPoint.display_name}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeData && (
          <Polyline
            positions={routeData.coordinates}
            color="#3b82f6"
            weight={5}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}
