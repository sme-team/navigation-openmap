// file: src/components/map/hooks/useLocationSearch.ts
import { useState, useCallback } from 'react';
import { Location } from '../types';
import { NOMINATIM_BASE_URL, PHOTON_BASE_URL, MIN_SEARCH_LENGTH } from '../constants';
import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.MAP);

export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  logger.trace("useLocationSearch() called");
  const searchLocation = useCallback(async (query: string) => {
    logger.trace("Starting location search for query:", query);
    if (!query || query.length < MIN_SEARCH_LENGTH) {
      logger.debug("Query too short, clearing results");
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Nominatim search
      logger.debug("Fetching from Nominatim");
      const nominatimResponse = await fetch(
        `${NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '8',
          countrycodes: 'vn',
          'accept-language': 'vi',
        })
      );
      
      const nominatimData = await nominatimResponse.json();
      logger.debug("Nominatim returned", nominatimData.length, "results");

      // Photon search
      logger.debug("Fetching from Photon");
      const photonResponse = await fetch(
        `${PHOTON_BASE_URL}/?` +
        new URLSearchParams({
          q: query,
          limit: '5',
          lang: 'vi',
          lon: '108.2022',
          lat: '16.0544',
        })
      );
      
      const photonData = await photonResponse.json();
      logger.debug("Photon returned", photonData.features?.length || 0, "results");
      
      // Combine and deduplicate results
      const combinedResults: Location[] = [];
      const seen = new Set<string>();

      // Process Nominatim results
      nominatimData.forEach((item: any) => {
        const key = `${item.lat}-${item.lon}`;
        if (!seen.has(key)) {
          seen.add(key);
          combinedResults.push({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            name: item.name || item.display_name.split(',')[0],
            address: item.address,
          });
        }
      });

      // Process Photon results
      photonData.features?.forEach((feature: any) => {
        const coords = feature.geometry.coordinates;
        const key = `${coords[1]}-${coords[0]}`;
        if (!seen.has(key)) {
          seen.add(key);
          const props = feature.properties;
          const name = props.name || props.street || props.city;
          const parts = [
            props.name,
            props.street,
            props.housenumber,
            props.city,
            props.state,
          ].filter(Boolean);
          
          combinedResults.push({
            lat: coords[1],
            lon: coords[0],
            display_name: parts.join(', '),
            name: name,
            address: props,
          });
        }
      });

      logger.trace("Search completed, combined", combinedResults.length, "unique results");
      setSearchResults(combinedResults);
      logger.debug("results", combinedResults);
      setShowResults(true);
    } catch (error) {
      logger.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    logger.trace("Clearing search results");
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    searchLocation,
    clearResults,
  };
};