// Import the main world countries data from a GeoJSON file
import countryData from "./world-countries.json";

// Import Singapore's boundary data from a separate GeoJSON file
import singaporeData from "./singapore.json";

/**
 * Combine the world countries GeoJSON data with Singapore's GeoJSON data.
 * This is necessary because the main 'world-countries.json' file doesn't 
 * include Singapore's boundary data, so we merge it manually.
 */
export const combinedCountryData = {
  ...countryData, // Spread the existing properties of the world countries data
  features: [...countryData.features, ...singaporeData.features] // Merge the 'features' array with Singapore's data
};