// src/components/map/constants.ts
import { Icon } from "leaflet";

export const DEFAULT_CENTER: [number, number] = [16.0544, 108.2022];
export const DEFAULT_ZOOM = 13;

export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
export const PHOTON_BASE_URL = 'https://photon.komoot.io/api';
export const OSRM_BASE_URL = 'https://router.project-osrm.org';

export const SEARCH_DEBOUNCE_MS = 400;
export const MIN_SEARCH_LENGTH = 3;

export const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const startIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiMxMGI5ODEiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const endIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiNlZjQ0NDQiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const MANEUVER_MAP: Record<string, string> = {
  'turn': 'Rẽ',
  'new name': 'Tiếp tục trên đường',
  'depart': 'Bắt đầu',
  'arrive': 'Đến nơi',
  'merge': 'Nhập làn',
  'on ramp': 'Lên đường cao tốc',
  'off ramp': 'Xuống đường cao tốc',
  'fork': 'Đi theo nhánh',
  'end of road': 'Cuối đường',
  'continue': 'Tiếp tục',
  'roundabout': 'Vào vòng xuyến',
  'rotary': 'Vào vòng xoay',
  'roundabout turn': 'Rẽ tại vòng xuyến',
};