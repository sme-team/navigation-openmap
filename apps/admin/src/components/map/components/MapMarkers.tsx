// src/components/map/components/MapMarkers.tsx
import { Marker, Popup, Polyline } from "react-leaflet";
import { Location, RouteData } from '../types';
import { defaultIcon, startIcon, endIcon } from '../constants';

interface MapMarkersProps {
  currentLocation: [number, number] | null;
  startPoint: Location | null;
  endPoint: Location | null;
  routeData: RouteData | null;
}

export const MapMarkers = ({
  currentLocation,
  startPoint,
  endPoint,
  routeData,
}: MapMarkersProps) => {
  return (
    <>
      {/* Current Location Marker */}
      {currentLocation && (
        <Marker position={currentLocation} icon={defaultIcon}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-base mb-1">Vị trí của bạn</h3>
              <p className="text-xs text-gray-600">
                {currentLocation[0].toFixed(6)}, {currentLocation[1].toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Start Point Marker */}
      {startPoint && (
        <Marker
          position={[startPoint.lat, startPoint.lon]}
          icon={startIcon}
        >
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
        <Marker
          position={[endPoint.lat, endPoint.lon]}
          icon={endIcon}
        >
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
    </>
  );
};