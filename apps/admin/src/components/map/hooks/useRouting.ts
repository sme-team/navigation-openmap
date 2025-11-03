// file: src/components/map/hooks/useRouting.ts
import { useState, useCallback } from "react";
import { Location, RouteData } from "../types";
import { OSRM_BASE_URL, MANEUVER_MAP } from "../constants";
import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.MAP);

export const useRouting = () => {
  logger.trace("useRouting() called");

  // Routing states
  const [routingMode, setRoutingMode] = useState(false);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  const [startPoint, setStartPoint] = useState<Location | null>(null);
  const [endPoint, setEndPoint] = useState<Location | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const getManeuverText = (type: string): string => {
    const text = MANEUVER_MAP[type] || type;
    logger.debug("Maneuver text for type:", type, "->", text);
    return text;
  };

  const calculateRoute = useCallback(async (start: Location, end: Location) => {
    logger.trace(
      "Starting route calculation from",
      start.name || start.display_name,
      "to",
      end.name || end.display_name
    );
    setIsRouting(true);
    try {
      const response = await fetch(
        `${OSRM_BASE_URL}/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?` +
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

        const newRouteData: RouteData = {
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
        return newRouteData;
      } else {
        logger.warn("No valid route found in OSRM response");
        alert("Không tìm thấy đường đi. Vui lòng thử lại với địa điểm khác.");
        return null;
      }
    } catch (error) {
      logger.error("Route calculation error:", error);
      alert("Không thể tính toán đường đi. Vui lòng thử lại.");
      return null;
    } finally {
      setIsRouting(false);
    }
  }, []);

  const resetRouting = useCallback(() => {
    logger.trace("Resetting routing state");
    setStartPoint(null);
    setEndPoint(null);
    setRouteData(null);
  }, []);

  const swapPoints = useCallback(() => {
    if (startPoint && endPoint) {
      logger.trace("Swapping start and end points");
      setStartPoint(endPoint);
      setEndPoint(startPoint);
      setRouteData(null);
    } else {
      logger.debug("Cannot swap points: missing start or end");
    }
  }, [startPoint, endPoint]);

  return {
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
  };
};
