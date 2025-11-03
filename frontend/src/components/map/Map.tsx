// file: src/components/map/Map.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { Location, InputType } from "./types";
import { DEFAULT_CENTER, DEFAULT_ZOOM, SEARCH_DEBOUNCE_MS } from "./constants";
import { useLocationSearch } from "./hooks/useLocationSearch";
import { useRouting } from "./hooks/useRouting";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { MapSearch } from "./components/MapSearch";
import { RouteInputs } from "./components/RouteInputs";
import { RouteInfo } from "./components/RouteInfo";
import { MapMarkers } from "./components/MapMarkers";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.MAP);

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

export default function Map({ query }: MapProps) {
  logger.trace("Map", "Map component initialized", { query });

  // Map states
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  // Search states
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [activeInput, setActiveInput] = useState<InputType>(null);

  // Custom hooks
  const {
    showResults,
    setShowResults,
    searchResults,
    isSearching,
    searchLocation,
    clearResults,
  } = useLocationSearch();

  const {
    routingMode,
    setRoutingMode,
    startInput,
    setStartInput,
    endInput,
    setEndInput,

    startPoint,
    endPoint,
    routeData,
    isRouting,
    setStartPoint,
    setEndPoint,
    calculateRoute,
    resetRouting,
    swapPoints,
  } = useRouting();
  const { currentLocation, getCurrentLocation } = useCurrentLocation();

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    logger.debug(
      "Map",
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

    logger.debug("Map", "Query", { query });

    if (query) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(query);
      }, SEARCH_DEBOUNCE_MS);
    } else {
      clearResults();
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    startInput,
    endInput,
    searchQuery,
    activeInput,
    searchLocation,
    clearResults,
  ]);

  // Handle get current location
  const handleGetCurrentLocation = useCallback(() => {
    logger.trace(
      "Map",
      "Handling get current location, routingMode:",
      routingMode
    );
    getCurrentLocation((loc, address) => {
      logger.debug(
        "Map",
        "Current location callback:",
        loc,
        "address:",
        address?.display_name
      );
      setMapCenter(loc);
      setMapZoom(15);

      if (routingMode && !startPoint && address) {
        setStartPoint(address);
        setStartInput(address.display_name || "Vị trí hiện tại");
      }
    });
  }, [getCurrentLocation, routingMode, startPoint, setStartPoint]);

  // Select location from search results
  const selectLocation = useCallback(
    (location: Location) => {
      logger.trace(
        "Map",
        "Selecting location:",
        location.name || location.display_name,
        "routingMode:",
        routingMode
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
      clearResults();
    },
    [
      routingMode,
      startPoint,
      endPoint,
      activeInput,
      setStartPoint,
      setEndPoint,
      clearResults,
    ]
  );

  // Reset routing and exit routing mode
  const handleResetRouting = useCallback(() => {
    logger.trace("Map", "Handling reset routing");
    resetRouting();
    setRoutingMode(false);
    setStartInput("");
    setEndInput("");
    setActiveInput(null);
  }, [resetRouting]);

  // Swap start and end points
  const handleSwapPoints = useCallback(() => {
    logger.trace(
      "Map",
      "Handling swap points, start:",
      !!startPoint,
      "end:",
      !!endPoint
    );
    swapPoints();
    const tempInput = startInput;
    setStartInput(endInput);
    setEndInput(tempInput);
  }, [swapPoints, startInput, endInput]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    logger.trace("Map", "Clearing search");
    setSearchQuery("");
    clearResults();
    setShowResults(false);
  }, [clearResults]);

  // Clear start point
  const handleClearStart = useCallback(() => {
    logger.trace("Map", "Clearing start point");
    setStartPoint(null);
    setStartInput("");
  }, [setStartPoint]);

  // Clear end point
  const handleClearEnd = useCallback(() => {
    logger.trace("Map", "Clearing end point");
    setEndPoint(null);
    setEndInput("");
  }, [setEndPoint]);

  // Auto calculate route when both points are set
  useEffect(() => {
    logger.debug(
      "Map",
      "Auto-route effect: startPoint",
      !!startPoint,
      "endPoint",
      !!endPoint
    );
    if (startPoint && endPoint) {
      calculateRoute(startPoint, endPoint).then((route) => {
        if (route && route.coordinates.length > 0) {
          logger.trace(
            "Map",
            "Route calculated, fitting map bounds, coordinates count:",
            route.coordinates.length
          );
          // Fit map to route bounds
          const lats = route.coordinates.map((c) => c[0]);
          const lons = route.coordinates.map((c) => c[1]);
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
        } else {
          logger.debug("Map", "No valid route coordinates to fit bounds");
        }
      });
    }
  }, [startPoint, endPoint, calculateRoute]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      logger.trace("Map", "Map component unmounting, cleaning up timeout");
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
              <MapSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                showResults={showResults}
                setShowResults={setShowResults}
                onSelectLocation={selectLocation}
                onGetCurrentLocation={handleGetCurrentLocation}
                onStartRouting={() => setRoutingMode(true)}
                onClearSearch={handleClearSearch}
              />
            ) : (
              <RouteInputs
                startInput={startInput}
                endInput={endInput}
                setStartInput={setStartInput}
                setEndInput={setEndInput}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
                startPoint={startPoint}
                endPoint={endPoint}
                onClearStart={handleClearStart}
                onClearEnd={handleClearEnd}
                onSwapPoints={handleSwapPoints}
                onGetCurrentLocation={handleGetCurrentLocation}
                onResetRouting={handleResetRouting}
                searchResults={searchResults}
                showResults={showResults}
                onSelectLocation={selectLocation}
              />
            )}
          </div>
        </div>
      </div>

      {/* Route Info Panel */}
      {routeData && (
        <RouteInfo routeData={routeData} onReset={handleResetRouting} />
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

        <MapMarkers
          currentLocation={currentLocation}
          startPoint={startPoint}
          endPoint={endPoint}
          routeData={routeData}
        />
      </MapContainer>
    </div>
  );
}
