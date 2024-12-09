import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { GOOGLE_API_ENDPOINTS } from "../constants/googleApiConstants";
import { GoogleAuthToken, YouTubeAccountInfo } from "../types/affiliateInfo";
import { LogType } from "../types/log";
import { request } from "http";

// Include the internal API key from environment variables
const INTERNAL_API_KEY = process.env.NEXT_PUBLIC_INTERNAL_API_KEY as string;

/**
 * Generate the authorization URL via the API.
 * This URL is used to redirect the user to Google's OAuth 2.0 authentication flow.
 * @param {string} userId - The Firestore document ID of the user.
 * @returns {Promise<string | undefined>} The generated authorization URL.
 */
export const generateGoogleAuthUrl = async (userId: string): Promise<string | undefined> => {
  try {
    if (!userId) {
      throw new Error("User ID is required to generate Google OAuth URL.");
    }

    // Fetch the Google OAuth2.0 authorization URL from the backend API
    const response = await fetch(GOOGLE_API_ENDPOINTS.AUTH_URL(userId), {
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
 * @param {string} userId - The Firestore document ID of the user.
 * @returns {Promise<any | undefined>} The token data.
 */
export const getGoogleTokens = async (code: string, userId: string): Promise<any | undefined> => {
  try {
    if (!userId) {
      throw new Error("User ID is required to exchange Google tokens.");
    }

    // Fetch tokens using the Google OAuth2.0 authorization code from the backend API
    const response = await fetch(GOOGLE_API_ENDPOINTS.GET_TOKEN(), {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({ code, userId }),
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
 * Fetch YouTube account information using the provided tokens and userId.
 * This function contacts the backend to retrieve the authenticated user's YouTube account information.
 * @param {string} userId - The Firestore document ID of the user.
 * @param {GoogleAuthToken} tokenData - The token data including access_token, refresh_token, and other necessary info.
 * @returns {Promise<YouTubeAccountInfo[] | undefined>} The YouTube account information.
 */
export const getYouTubeAccountInfo = async (
  userId: string,
  tokenData: GoogleAuthToken
): Promise<YouTubeAccountInfo[] | undefined> => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch YouTube account information.");
    }

    // Combine userId and tokenData into a single object for the request body
    const requestBody = {
      ...tokenData,
      userId, // Add userId to the request body
    };

    // Fetch YouTube account info using the provided tokens from the backend API
    const response = await fetch(GOOGLE_API_ENDPOINTS.YOUTUBE_USER_INFO(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(requestBody),
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
 * @param {string} userId - The Firestore document ID of the user.
 * @param {GoogleAuthToken} tokenData - The token data including access_token, refresh_token, and other necessary info.
 * @param {string} channelId - The YouTube channel ID from which to retrieve videos.
 * @param {string} filterKeyword - The keyword to filter videos by their description.
 * @param addLog - A function to log messages during the fetching process.
 * @returns {Promise<any[] | undefined>} The filtered video information.
 */
export const getFilteredYouTubeVideos = async (
  userId: string,
  tokenData: GoogleAuthToken,
  channelId: string,
  filterKeyword: string,
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<any[] | undefined> => {
  try {
    const apiUrl = GOOGLE_API_ENDPOINTS.YOUTUBE_VIDEO_FETCH();
    addLog(`Calling API: ${apiUrl} for channel: ${channelId} with filter: ${filterKeyword}`, "log", 3);

    // Construct the request body with userId, tokenData, channelId, and filterKeyword
    const requestBody = {
      userId,
      tokenData,
      channelId,
      filterKeyword,
    };

    // Fetch filtered YouTube videos using the provided tokens from the backend API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(requestBody),
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

/**
 * Update the Google access token, expiry date, and optionally the refresh token in Firestore for a specific user.
 * This function ensures only the necessary fields are updated.
 * 
 * @param userId - The user ID or document ID in Firestore.
 * @param accessToken - The new access token to be saved.
 * @param expiryDate - The new expiry date of the access token (in UNIX timestamp format).
 * @param refreshToken - (Optional) The new refresh token to be saved if provided.
 */
export const updateGoogleTokensInFirestore = async (
  userId: string,
  accessToken: string,
  expiryDate: number,
  refreshToken?: string
) => {
  try {
    const userDocRef = doc(db, "users", userId); // Reference to the Firestore "users" document

    // Construct update data dynamically
    const updateData: Record<string, any> = {
      "googleAuthToken.access_token": accessToken, // Update access token
      "googleAuthToken.expiry_date": expiryDate,  // Update expiry date
    };

    if (refreshToken) {
      updateData["googleAuthToken.refresh_token"] = refreshToken; // Update refresh token if provided
    }

    // Update Firestore document with new token data
    await updateDoc(userDocRef, updateData);

    console.log("Successfully updated Google tokens in Firestore.");
  } catch (error) {
    console.error("Failed to update Google tokens in Firestore:", error);
    throw error; // Rethrow the error for upstream handling
  }
};