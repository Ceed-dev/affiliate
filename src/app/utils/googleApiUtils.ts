import { GOOGLE_API_ENDPOINTS } from "../constants/googleApiConstants";

// Include the internal API key from environment variables
const INTERNAL_API_KEY = process.env.NEXT_PUBLIC_INTERNAL_API_KEY as string;

/**
 * Generate the authorization URL via the API.
 * This URL is used to redirect the user to Google's OAuth 2.0 authentication flow.
 * @returns {Promise<string | undefined>} The generated authorization URL.
 */
export const generateGoogleAuthUrl = async (): Promise<string | undefined> => {
  try {
    // Fetch the Google OAuth2.0 authorization URL from the backend API
    const response = await fetch(GOOGLE_API_ENDPOINTS.AUTH_URL(), {
      headers: { "internal-api-key": INTERNAL_API_KEY }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Google OAuth2 URL");
    }

    const { authUrl } = await response.json();

    return authUrl;  // Return the authorization URL
  } catch (error) {
    console.error("Error during Google OAuth2 authentication:", error);
    return undefined;  // Return undefined in case of an error
  }
};