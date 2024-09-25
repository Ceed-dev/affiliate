import { countryToAlpha2 } from "country-to-iso";

const ipstackApiKey = process.env.NEXT_PUBLIC_IPSTACK_API_KEY;

interface LocationData {
  country_name?: string;
  region_name?: string;
  city?: string;
  [key: string]: any;  // Allow for any additional fields
}

/**
 * Fetches location data based on the provided IP address using the ipstack API.
 * If the API call is successful, it returns the location data as a JSON object.
 * In case of failure, it logs the error and rethrows it for further handling.
 * 
 * @param {string} ip - The IP address for which to fetch location data.
 * @returns {Promise<LocationData>} - A promise that resolves to the location data.
 * @throws {Error} - Throws an error if the API call fails.
 */
export async function fetchLocationData(ip: string): Promise<LocationData> {
  try {
    // Make a request to the ipstack API to fetch location data for the given IP
    const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${ipstackApiKey}`);

    // Use type assertion to tell TypeScript that the response is of type LocationData
    const locationData = await response.json() as LocationData;

    // Return the location data
    return locationData;
  } catch (error) {
    // Log the error and rethrow it for further error handling
    console.error("Failed to fetch location data: ", error);
    throw error;
  }
}

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
    return "XK";  // Return "XK" for Kosovo
  } else if (countryName === "Macedonia") {
    return "MK";  // Return "MK" for Macedonia
  }

  // Attempt to retrieve the ISO Alpha-2 code for the given country name
  // Northern Cyprus, Somaliland, and West Bank do not have flags in flagcdn, so no flag will be displayed
  const isoCode = countryToAlpha2(countryName);

  // If no matching country is found, return 'unknown'
  return isoCode || "unknown";
};
