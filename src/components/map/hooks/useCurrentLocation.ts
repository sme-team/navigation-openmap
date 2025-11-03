// file: src/components/map/hooks/useCurrentLocation.ts
import { useState, useCallback } from "react";
import { Location } from "../types";
import { NOMINATIM_BASE_URL } from "../constants";
import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.MAP);

export const useCurrentLocation = () => {
  logger.trace("useCurrentLocation() called");
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);

  const getCurrentLocation = useCallback(
    (onSuccess?: (location: [number, number], address?: Location) => void) => {
      logger.trace("getCurrentLocation() called with onSuccess:", !!onSuccess);
      if (navigator.geolocation) {
        logger.debug("Geolocation supported, requesting position");
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc: [number, number] = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            logger.debug("Position obtained:", loc);
            setCurrentLocation(loc);

            // Reverse geocode to get address
            logger.debug("Starting reverse geocoding for location:", loc);
            try {
              const response = await fetch(
                `${NOMINATIM_BASE_URL}/reverse?` +
                  new URLSearchParams({
                    lat: loc[0].toString(),
                    lon: loc[1].toString(),
                    format: "json",
                    addressdetails: "1",
                    "accept-language": "vi",
                  })
              );

              const data = await response.json();
              logger.debug("Reverse geocoding successful:", data.display_name);
              const address: Location = {
                lat: loc[0],
                lon: loc[1],
                display_name: data.display_name || "Vị trí hiện tại",
                name: "Vị trí của bạn",
                address: data.address,
              };

              onSuccess?.(loc, address);
            } catch (error) {
              logger.error("Reverse geocode error:", error);
              onSuccess?.(loc);
            }
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
    },
    []
  );

  return {
    currentLocation,
    getCurrentLocation,
  };
};
