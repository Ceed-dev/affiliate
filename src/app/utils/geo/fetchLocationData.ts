import fetch from "node-fetch";

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
