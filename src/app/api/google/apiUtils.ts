import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Initialize OAuth2 client as null. It will be instantiated only once.
let oauth2Client: OAuth2Client | null = null;

/**
 * Get the OAuth2Client instance.
 * If the client doesn't exist yet, it will be created with the necessary parameters.
 * @returns {Promise<OAuth2Client>} The OAuth2Client instance.
 */
export const getGoogleOAuth2Client = async (): Promise<OAuth2Client> => {
  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding`, // Callback URL to redirect the user after OAuth process
    });

    // Set up the tokens event to handle refresh token
    oauth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        // TODO: Store refresh token to your database for later use
        console.log("New refresh token received:", tokens.refresh_token);
      }
      console.log("New access token received:", tokens.access_token);
    });
  }

  return oauth2Client;
};

/**
 * Note: 
 * Access tokens expire after a certain period, and the client automatically uses the refresh token 
 * to acquire a new access token if it is about to expire. The tokens event is triggered when a 
 * new token is received (either an access token or a refresh token). If a refresh token is present, 
 * it should be stored securely in your database.
 * 
 * However, refresh tokens can become invalid in the following cases:
 * - The user has revoked your app's access.
 * - The refresh token has not been used for more than 6 months.
 * - The user changed their password, and the refresh token includes Gmail scopes.
 * - The user account exceeds the maximum number of live refresh tokens.
 * - The application is in 'Testing' status, and the consent screen is set to 'External' user type, 
 *   causing the token to expire in 7 days.
 * 
 * Developers should implement proper error handling to manage scenarios where a refresh token 
 * is no longer valid.
 * [Ref: https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#handling-refresh-tokens]
 */