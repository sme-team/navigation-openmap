// src/components/map/components/RouteInputs.tsx
import { X, Navigation, Navigation2, Trash2, MapPin } from "lucide-react";
import { Location, InputType } from '../types';

interface RouteInputsProps {
  startInput: string;
  endInput: string;
  setStartInput: (value: string) => void;
  setEndInput: (value: string) => void;
  activeInput: InputType;
  setActiveInput: (type: InputType) => void;
  startPoint: Location | null;
  endPoint: Location | null;
  onClearStart: () => void;
  onClearEnd: () => void;
  onSwapPoints: () => void;
  onGetCurrentLocation: () => void;
  onResetRouting: () => void;
  searchResults: Location[];
  showResults: boolean;
  onSelectLocation: (location: Location) => void;
}

export const RouteInputs = ({
  startInput,
  endInput,
  setStartInput,
  setEndInput,
  activeInput,
  setActiveInput,
  startPoint,
  endPoint,
  onClearStart,
  onClearEnd,
  onSwapPoints,
  onGetCurrentLocation,
  onResetRouting,
  searchResults,
  showResults,
  onSelectLocation,
}: RouteInputsProps) => {
  return (
    <>
      <div className="space-y-3">
        {/* Start Input */}
        <div className="relative">
          <input
            type="text"
            value={startInput}
            onChange={(e) => {
              setStartInput(e.target.value);
              setActiveInput('start');
            }}
            onFocus={() => {
              setActiveInput('start');
            }}
            placeholder="Điểm xuất phát..."
            className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-green-300 
                     bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
          {startInput && (
            <button
              onClick={onClearStart}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-red-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Swap Button */}
        {startPoint && endPoint && (
          <button
            onClick={onSwapPoints}
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
              setActiveInput('end');
            }}
            onFocus={() => {
              setActiveInput('end');
            }}
            placeholder="Điểm đến..."
            className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-red-300 
                     bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-red-500" />
          {endInput && (
            <button
              onClick={onClearEnd}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-red-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onGetCurrentLocation}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
        >
          <Navigation size={16} />
          Vị trí
        </button>

        <button
          onClick={onResetRouting}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm ml-auto"
        >
          <Trash2 size={16} />
          Xóa
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="border-t border-blue-200 max-h-80 overflow-y-auto mt-4 -mx-4 -mb-4">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => onSelectLocation(result)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 mt-1 flex-shrink-0" />
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
    </>
  );
};