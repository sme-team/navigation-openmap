"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

interface MapWrapperProps {
  id?: string; // cho id của guest có hiệu lực một thời gian
  query?: string;
}

export default function MapWrapper({ id, query }: MapWrapperProps) {
  return <Map query={query} />;
}
