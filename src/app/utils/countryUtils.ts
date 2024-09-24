// Import the `country-to-iso` package to convert country names to ISO 3166-1 Alpha-2 country codes
import { countryToAlpha2 } from "country-to-iso";

/**
 * Returns the ISO 3166-1 Alpha-2 code for a given country name.
 *
 * @param {string} countryName - The full name of the country (e.g., "United States").
 * @returns {string} - The corresponding ISO Alpha-2 country code (e.g., "US").
 *                     If the country name is not found, returns "unknown".
 */
export const getCountryCodeFromName = (countryName: string): string => {
  // Handle specific exceptions where the country name needs manual adjustment
  if (countryName === "Myanmar (Burma)") {
    countryName = "Myanmar";
  } else if (countryName === "Republic of Serbia") {
    countryName = "Serbia";
  } else if (countryName === "Kosovo") {
    return "XK";  // Return 'XK' for Kosovo
  }

  // Attempt to retrieve the ISO Alpha-2 code for the given country name
  const isoCode = countryToAlpha2(countryName);

  // If no matching country is found, return 'unknown'
  return isoCode || "unknown";
};
