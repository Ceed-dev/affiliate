/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "pbs.twimg.com",
      "yt3.ggpht.com",
    ],
  },
  /** 
   * Disabling React's Strict Mode.
   * This prevents React from rendering components twice in development mode, which 
   * can cause issues such as making API calls multiple times. It is safe to disable 
   * in production, but React recommends using it in development to catch potential problems.
   */
  reactStrictMode: false,

  /**
   * Configures CORS headers for the /api/conversion route.
   * These headers allow cross-origin requests and manage permissions 
   * for credentials, methods, and headers.
   *
   * - Access-Control-Allow-Credentials: 'true'
   *   Allows credentials (e.g., cookies, authorization headers) to be included in requests,
   *   enabling the server to maintain user sessions or authentication states.
   *
   * - Access-Control-Allow-Methods: 'OPTIONS,POST'
   *   Specifies the HTTP methods that are allowed for this endpoint. 
   *   Here, OPTIONS is for preflight requests, and POST is for data submission.
   *
   * - Access-Control-Allow-Headers: 'x-api-key, Content-Type'
   *   Lists the allowed headers that clients can include in requests.
   *   'x-api-key' is required for API authentication, and 'Content-Type' 
   *   is necessary for specifying the format of the data being sent.
   *
   * Note: The specific origin control is handled within the API route itself, 
   * so here, we do not include Access-Control-Allow-Origin.
   */
  async headers() {
    return [
      {
        source: "/api/conversion",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "OPTIONS,POST" },
          { key: "Access-Control-Allow-Headers", value: "x-api-key, Content-Type" }
        ]
      }
    ];
  }
};

export default nextConfig;