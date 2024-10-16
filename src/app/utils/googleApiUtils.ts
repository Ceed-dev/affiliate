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

/**
 * Exchange the authorization code for tokens via the API.
 * This function contacts the backend to exchange the code for access and refresh tokens.
 * @param {string} code - The authorization code received from Google OAuth.
 * @returns {Promise<any | undefined>} The token data.
 */
export const getGoogleTokens = async (code: string): Promise<any | undefined> => {
  try {
    // Fetch tokens using the Google OAuth2.0 authorization code from the backend API
    const response = await fetch(GOOGLE_API_ENDPOINTS.GET_TOKEN(), {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange Google OAuth2 code for tokens");
    }

    const tokenData = await response.json();

    return tokenData;  // Return the token data
  } catch (error) {
    console.error("Error during Google OAuth2 token exchange:", error);
    return undefined;  // Return undefined in case of an error
  }
};