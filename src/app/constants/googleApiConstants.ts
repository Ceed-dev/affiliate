/**
 * API Endpoints used for Google API integration.
 * Functions are provided to dynamically insert required parameters.
 */
export const GOOGLE_API_ENDPOINTS = {
  /**
   * Endpoint for generating the Google OAuth authorization URL.
   * @returns {string} Full URL to initiate the Google OAuth flow.
   */
  AUTH_URL: (): string => `/api/google/auth/getAuthUrl`,

  /**
   * Endpoint for exchanging the Google OAuth authorization code for tokens.
   * @returns {string} Full URL to exchange the code for tokens.
   */
  GET_TOKEN: (): string => `/api/google/auth/getToken`,
};