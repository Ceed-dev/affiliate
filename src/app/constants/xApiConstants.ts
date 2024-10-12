// Exporting an array of references related to X API for easy access to documentation and tools.
export const X_API_REFERENCES = [
  {
    title: "Developer Portal", 
    url: "https://developer.twitter.com/en/portal/dashboard"
    // Link to the X Developer Portal where you can manage your apps, view analytics, and get credentials.
  },
  {
    title: "Tweets Lookup", 
    url: "https://developer.x.com/en/docs/x-api/tweets/lookup/api-reference/get-tweets"
    // API documentation for the 'Get Tweets' endpoint, which allows you to look up tweets by various parameters.
  },
  {
    title: "API Editor", 
    url: "https://developer.twitter.com/apitools/api?endpoint=%2F2%2Ftweets&method=get"
    // Link to the X API Editor where you can interactively test API endpoints like retrieving tweets.
  },
];

/**
 * API Endpoints used throughout the application.
 * Functions are provided to dynamically insert required parameters such as `code` and `state`.
 */
export const API_ENDPOINTS = {
  /**
   * Endpoint for fetching the OAuth access token using authorization code and state.
   * @param {string} code - Authorization code received from OAuth flow.
   * @param {string} state - State parameter to ensure the validity of the request.
   * @returns {string} Full URL for the access token request.
   */
  AUTH: (code: string, state: string): string => `/api/x/auth?code=${code}&state=${state}`,

  /**
   * Endpoint for fetching user information.
   * @param {Object} tokenData - The token object containing access token and other information.
   * @returns {string} Full URL for the user information request with encoded token data.
   */
  USER: (tokenData: { access_token: string, token_type: string, scope: string, refresh_token: string, expires_at: number }): string => {
    return `/api/x/user?tokenData=${encodeURIComponent(JSON.stringify(tokenData))}`;
  },

  /**
   * Endpoint for recent tweet search.
   * @param {string} username - The username of the user whose tweets are being searched.
   * @param {string} referralId - The referral ID associated with the tweets.
   * @param {string} tweetNewestId - (Optional) The newest tweet ID to filter tweets from a specific point in time.
   * @returns {string} Full URL for the recent tweet search request.
   */
  TWEET_RECENT_SEARCH: (username: string, referralId: string, tweetNewestId?: string): string => {
    return `/api/x/tweetRecentSearch?username=${username}&referralId=${referralId}${tweetNewestId ? `&tweetNewestId=${tweetNewestId}` : ""}`;
  },

  /**
   * Endpoint for fetching tweet engagement data for specific tweet IDs.
   * @param {string[]} tweetIds - An array of tweet IDs to fetch engagement data for.
   * @returns {string} Full URL for the tweet engagement request with encoded tweet IDs.
   */
  TWEET_LOOKUP: (tweetIds: string[]): string => {
    return `/api/x/tweetLookup?tweetIds=${encodeURIComponent(tweetIds.join(","))}`;
  }
};