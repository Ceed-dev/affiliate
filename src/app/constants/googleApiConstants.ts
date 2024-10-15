/**
 * API Endpoints used for Google API integration.
 * Functions are provided to dynamically insert required parameters such as `code` and `state`.
 */
export const GOOGLE_API_ENDPOINTS = {
  /**
   * Endpoint for generating the Google OAuth authorization URL.
   * @returns {string} Full URL to initiate the Google OAuth flow.
   */
  AUTH_URL: (): string => `/api/google/getAuthUrl`,
};