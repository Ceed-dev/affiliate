import { GOOGLE_API_ENDPOINTS } from "../constants/googleApiConstants";
import { GoogleAuthToken, YouTubeAccountInfo } from "../types/affiliateInfo";
import { LogType } from "../types/log";

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

/**
 * Fetch YouTube account information using the provided tokens.
 * This function contacts the backend to retrieve the authenticated user's YouTube account information.
 * @param {GoogleAuthToken} tokenData - The token data including access_token, refresh_token, and other necessary info.
 * @returns {Promise<YouTubeAccountInfo[] | undefined>} The YouTube account information.
 */
export const getYouTubeAccountInfo = async (tokenData: GoogleAuthToken): Promise<YouTubeAccountInfo[] | undefined> => {
  try {
    // Fetch YouTube account info using the provided tokens from the backend API
    const response = await fetch(GOOGLE_API_ENDPOINTS.YOUTUBE_USER_INFO(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(tokenData),
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve YouTube account information");
    }

    const accountInfo = await response.json();

    // Return the items array which contains the YouTube account data
    return accountInfo.items;
  } catch (error) {
    console.error("Error retrieving YouTube account information:", error);
    return undefined;  // Return undefined in case of an error
  }
};

/**
 * Fetch YouTube videos filtered by description keywords using the provided tokens.
 * This function contacts the backend to retrieve videos from a specific channel and filters them based on the description.
 * @param {GoogleAuthToken} tokenData - The token data including access_token, refresh_token, and other necessary info.
 * @param {string} channelId - The YouTube channel ID from which to retrieve videos.
 * @param {string} filterKeyword - The keyword to filter videos by their description.
 * @param addLog - A function to log messages during the fetching process.
 * @returns {Promise<any[] | undefined>} The filtered video information.
 */
export const getFilteredYouTubeVideos = async (
  tokenData: GoogleAuthToken,
  channelId: string,
  filterKeyword: string,
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<any[] | undefined> => {
  try {
    const apiUrl = GOOGLE_API_ENDPOINTS.YOUTUBE_VIDEO_FETCH();
    addLog(`Calling API: ${apiUrl} for channel: ${channelId} with filter: ${filterKeyword}`, "log", 3);

    // Fetch filtered YouTube videos using the provided tokens from the backend API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({ tokenData, channelId, filterKeyword }),
    });

    // Check if the API request was successful
    if (!response.ok) {
      addLog(`Failed to fetch YouTube video data: ${response.statusText}`, "error", 3);
      throw new Error(`Failed to fetch YouTube video data: ${response.statusText}`);
    }

    addLog("Successfully fetched YouTube video data.", "log", 3);

    const videoData = await response.json();

    // Return the filtered videos array
    return videoData.filteredVideos;
  } catch (error: any) {
    addLog(`Error fetching YouTube video data for channel: ${channelId}, Message: ${error.message}`, "error", 3);
    console.error("Error retrieving filtered YouTube videos:", error);
    return undefined; // Return undefined in case of an error
  }
};