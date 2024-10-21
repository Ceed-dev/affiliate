// Exporting an array of references related to YouTube API for easy access to documentation and tools.
export const YOUTUBE_API_REFERENCES = [
  {
    title: "Overview of YouTube Data API", 
    url: "https://developers.google.com/youtube/v3/getting-started"
    // Link to the overview of YouTube Data API v3. This page explains how to get started, obtain credentials, and understand API usage.
  },
  {
    title: "Videos: List API Documentation", 
    url: "https://developers.google.com/youtube/v3/docs/videos/list"
    // API documentation for the 'Videos: List' endpoint, which retrieves video details like title, description, and statistics.
  },
  {
    title: "Search: List API Documentation", 
    url: "https://developers.google.com/youtube/v3/docs/search/list"
    // API documentation for the 'Search: List' endpoint, allowing video searches and retrieval of channel information.
  },
  {
    title: "API Quota Management", 
    url: "https://developers.google.com/youtube/v3/getting-started#quota"
    // Information on managing API quotas and understanding API usage limits.
  },
  {
    title: "OAuth 2.0 Authentication", 
    url: "https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps"
    // Guide on OAuth 2.0 authentication for YouTube API, specifically for server-side web applications.
  },
];

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

  /**
   * Endpoint for retrieving YouTube account information.
   * @returns {string} Full URL to get the YouTube account information.
   */
  YOUTUBE_USER_INFO: (): string => `/api/google/youtube/user`,

  /**
   * Endpoint for fetching YouTube videos filtered by description keyword.
   * @returns {string} Full URL to retrieve YouTube videos with engagement data.
   */
  YOUTUBE_VIDEO_FETCH: (): string => `/api/google/youtube/video`,
};