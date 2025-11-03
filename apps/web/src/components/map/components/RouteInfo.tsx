// src/components/map/components/RouteInfo.tsx
import { X, Ruler, Clock, Route as RouteIcon } from "lucide-react";
import { RouteData } from '../types';

interface RouteInfoProps {
  routeData: RouteData;
  onReset: () => void;
}

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

export const RouteInfo = ({ routeData, onReset }: RouteInfoProps) => {
  return (
    <>
      {/* Desktop Version */}
      <div className="absolute top-4 right-4 z-[1000] max-w-sm hidden md:block">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Thông tin lộ trình</h3>
            <button
              onClick={onReset}
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
                <div className="text-xs text-gray-600">Thời gian ước tính</div>
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
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
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

      {/* Mobile Version */}
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
              const instructions = document.querySelector('.mobile-instructions');
              if (instructions) {
                instructions.classList.toggle('hidden');
              }
            }}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Xem hướng dẫn chi tiết
          </button>

          <div className="mobile-instructions hidden mt-3 max-h-40 overflow-y-auto space-y-2">
            {routeData.instructions.slice(0, 10).map((instruction, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p>{instruction.text}</p>
                  <p className="text-gray-500 mt-1">{formatDistance(instruction.distance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};