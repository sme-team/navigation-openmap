// src/components/map/types.ts

export interface Location {
  lat: number;
  lon: number;
  display_name: string;
  name?: string;
  address?: any;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  instructions: Array<{
    text: string;
    distance: number;
    duration: number;
  }>;
}

export type InputType = 'start' | 'end' | null;