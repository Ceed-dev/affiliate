import { auth, Client } from "twitter-api-sdk";
import { XAuthToken } from "../types/affiliateInfo";

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
 * @param {string | null} token - The OAuth2User token to be used for authentication.
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