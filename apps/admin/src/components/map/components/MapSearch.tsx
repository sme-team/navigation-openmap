// src/components/map/components/MapSearch.tsx
import {
  Search,
  X,
  Loader,
  MapPin,
  Navigation,
  Route as RouteIcon,
} from "lucide-react";
import { Location } from "../types";

interface MapSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Location[];
  isSearching: boolean;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  onSelectLocation: (location: Location) => void;
  onGetCurrentLocation: () => void;
  onStartRouting: () => void;
  onClearSearch: () => void;
}

export const MapSearch = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  showResults,
  setShowResults,
  onSelectLocation,
  onGetCurrentLocation,
  onStartRouting,
  onClearSearch,
}: MapSearchProps) => {
  return (
    <>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
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
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onGetCurrentLocation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Navigation size={18} />
          <span className="text-sm font-medium">Vị trí của tôi</span>
        </button>

        <button
          onClick={onStartRouting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <RouteIcon size={18} />
          <span className="text-sm font-medium">Chỉ đường</span>
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
    </>
  );
};
