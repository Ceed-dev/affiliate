// Import the main world countries data from a GeoJSON file
import countryData from "./world-countries.json";

// Import Singapore's boundary data from a separate GeoJSON file
import singaporeData from "./singapore.json";

// Import Faroe Islands' boundary data from a separate GeoJSON file
import faroeIslandsData from "./faroe-islands.json";

/**
 * Combine the world countries GeoJSON data with Singapore's and Faroe Islands' GeoJSON data.
 * This is necessary because the main 'world-countries.json' file doesn't 
 * include the boundary data for Singapore and the Faroe Islands, so we merge them manually.
 */
export const combinedCountryData = {
  ...countryData, // Spread the existing properties of the world countries data
  features: [
    ...countryData.features, 
    ...singaporeData.features, 
    ...faroeIslandsData.features // Merge the 'features' array with Singapore and Faroe Islands data
  ]
};