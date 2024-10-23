import { auth, Client } from "twitter-api-sdk";
import { XAuthToken } from "../types/affiliateInfo";
import { API_ENDPOINTS } from "../constants/xApiConstants";
import { LogType } from "../types/log";

// Include the internal API key from environment variables
const INTERNAL_API_KEY = process.env.NEXT_PUBLIC_INTERNAL_API_KEY as string;

// Initialize clients as null. They will be instantiated only once.
let authClient: auth.OAuth2User | null = null;
let bearerClient: auth.OAuth2Bearer | null = null;

/**
 * Get the OAuth2User client instance.
 * If the client doesn't exist yet, it will be created with the necessary parameters.
 * This is used for user-specific authentication.
 * @returns {auth.OAuth2User} The OAuth2User client instance.
 */
export const getXAuthClient = async (): Promise<auth.OAuth2User> => {
  if (!authClient) {
    authClient = new auth.OAuth2User({
      client_id: process.env.NEXT_PUBLIC_X_API_CLIENT_ID as string,
      client_secret: process.env.NEXT_PUBLIC_X_API_CLIENT_SECRET as string,
      callback: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding`, // Callback URL to redirect the user to the /onboarding page after OAuth process.
      scopes: ["tweet.read", "users.read", "offline.access"], // Define the required scopes
    });
  }

  // Check if the token exists before checking for expiration
  if (authClient.token && authClient.isAccessTokenExpired()) {
    console.log("Access token expired. Refreshing...");
    // TODO: Store refresh token to your database for later use
    await authClient.refreshAccessToken();
  }

  return authClient;
};

/**
 * Get the OAuth2Bearer client instance.
 * If the client doesn't exist yet, it will be created with the necessary parameters.
 * This is used for application-level authentication (Bearer token).
 * @returns {auth.OAuth2Bearer} The OAuth2Bearer client instance.
 */
export const getXBearerClient = (): auth.OAuth2Bearer => {
  if (!bearerClient) {
    bearerClient = new auth.OAuth2Bearer(process.env.NEXT_PUBLIC_X_API_BEARER_TOKEN as string);
  }
  return bearerClient;
};

/**
 * Generate the authorization URL.
 * This URL is used to redirect the user to X's OAuth 2.0 authentication flow.
 * @returns {Promise<string>} The generated authorization URL.
 */
export const generateXAuthUrl = async (): Promise<string> => {
  const authClient = await getXAuthClient(); // Await the promise from getXAuthClient
  return authClient.generateAuthURL({
    state: process.env.NEXT_PUBLIC_X_API_OAUTH_STATE as string, // Use environment variable for OAUTH_STATE
    code_challenge: "sushi", // In "plain" method, code_verifier is directly used as the challenge
    code_challenge_method: "plain", // Using the plain method for simplicity
  });
};

/**
 * Get the X API Client instance.
 * Uses the authenticated OAuth2User or OAuth2Bearer client depending on the use case.
 * If using OAuth2User, it checks for token expiration and refreshes if necessary.
 * @param {XAuthToken | null} token - The OAuth2User token to be used for authentication.
 * @param {boolean} useBearer - If true, uses the OAuth2Bearer client. Defaults to false (OAuth2User).
 * @returns {Promise<Client>} The X API client instance.
 */
export const getXApiClient = async (token: XAuthToken | null = null, useBearer: boolean = false): Promise<Client> => {
  // Always create a new client instance for different token types (bearer or OAuth2User)
  const client = useBearer ? getXBearerClient() : await getXAuthClient();

  // If useBearer is false (using OAuth2User), ensure token is provided
  if (!useBearer && !token) {
    throw new Error("Token is required when using OAuth2User.");
  }

  // If a token is provided and not using bearer token, manually set the token in the authClient
  if (token && !useBearer) {
    (client as auth.OAuth2User).token = token;
  }

  // Return a new Client instance for each API request to ensure the correct token is used
  return new Client(client);
};

/**
 * Fetches the latest tweet engagement data for the given array of past tweet IDs by calling the Qube product's tweet lookup API.
 * 
 * @param {string[]} pastTweetIds - Array of tweet IDs to fetch engagement data for.
 * @param addLog - A function to log messages during the fetching process.
 * @returns {Promise<any[]>} - A promise that resolves to an array of engagement data for each tweet.
 */
export const fetchTweetEngagementForPastTweets = async (
  pastTweetIds: string[],
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<any[]> => {
  try {
    // Construct the full URL for the tweet lookup API
    const apiUrl = API_ENDPOINTS.TWEET_LOOKUP(pastTweetIds);

    addLog(`Calling API: ${apiUrl}`, "log", 3);

    // Send a GET request to the Qube API's tweet lookup endpoint, passing the tweet IDs
    const response = await fetch(apiUrl, {
      method: "GET",  // Using GET method to retrieve data
      headers: {
        "internal-api-key": INTERNAL_API_KEY,  // Send internal API key
      }
    });

    // Check if the API request was successful
    if (!response.ok) {
      addLog(`Failed to fetch tweet engagement data: ${response.statusText}`, "error", 3);
      throw new Error(`Failed to fetch tweet engagement data: ${response.statusText}`);
    }

    // Parse and return the response as JSON, which contains the tweet engagement data
    const tweetEngagementData = await response.json();
    addLog(`Successfully fetched engagement data for ${pastTweetIds.length} past tweets.`, "log", 3);

    return tweetEngagementData;
  } catch (error: any) {
    addLog(`Error fetching tweet engagement data for past tweets. Message: ${error.message}`, "error", 3);
    console.error("Error fetching tweet engagement data for past tweets:", error);
    throw new Error("Failed to fetch tweet engagement data for past tweets");
  }
};

/**
 * Fetches recent tweet engagement data for a given username and referral ID.
 * Calls the Qube API's recent tweet search endpoint.
 *
 * @param username - The username of the X account to search for tweets.
 * @param referralId - The referral ID associated with the tweets.
 * @param xAuthToken - The user's X API authentication token.
 * @param addLog - A function to add log entries for tracking the process.
 * @param tweetNewestId - (Optional) The newest tweet ID to filter tweets from a specific point in time.
 * @returns {Promise<any[]>} - An array of engagement data for the fetched tweets.
 */
export const fetchTweetEngagementForRecentTweets = async (
  username: string, 
  referralId: string, 
  xAuthToken: string, 
  addLog: (log: string, type: LogType, indentLevel?: number) => void,
  tweetNewestId?: string,
): Promise<any[]> => {
  try {
    // Construct the full URL for the recent tweet search API
    const apiUrl = API_ENDPOINTS.TWEET_RECENT_SEARCH(username, referralId, tweetNewestId);

    addLog(`Calling API: ${apiUrl}`, "log", 3);

    // Call the Qube API to fetch the tweet engagement data
    const response = await fetch(apiUrl, {
      method: "GET", // Using GET method to retrieve data
      headers: {
        "internal-api-key": INTERNAL_API_KEY,  // Send internal API key
      },
    });

    // Check if the API request was successful
    if (!response.ok) {
      addLog(`Failed to fetch tweet engagement data: ${response.statusText}`, "error", 3);
      throw new Error(`Failed to fetch recent tweet engagement data: ${response.statusText}`);
    }

    addLog("Successfully fetched recent tweet engagement data.", "log", 3);

    // Return the tweet engagement data as JSON
    const tweetEngagementData = await response.json();
    return tweetEngagementData;
  } catch (error: any) {
    addLog(`Error fetching tweet engagement data for username: ${username} and referralId: ${referralId}, Message: ${error.message}`, "error", 3);
    console.error(`Error fetching recent tweet engagement data for username: ${username} and referralId: ${referralId}`, error);
    throw new Error(`Failed to fetch recent tweet engagement data for username: ${username} and referralId: ${referralId}`);
  }
};