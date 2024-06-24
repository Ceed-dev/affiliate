import fetch from "node-fetch";

const ipstackApiKey = process.env.NEXT_PUBLIC_IPSTACK_API_KEY;

export async function fetchLocationData(ip: string): Promise<any> {
  try {
    const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${ipstackApiKey}`);
    const locationData = await response.json();
    return locationData;
  } catch (error) {
    console.error("Failed to fetch location data: ", error);
    throw error;
  }
}
