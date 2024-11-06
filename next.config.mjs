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
   * Adding CORS headers for API routes to allow requests from different origins.
   * This configuration allows Cross-Origin Resource Sharing (CORS) for any domain,
   * enabling external applications to interact with this application's API endpoints
   * under the /api/ path. It includes the following headers:
   * 
   * - Access-Control-Allow-Credentials: 'true'
   *   Allows credentials (e.g., cookies, authorization headers) to be included in requests.
   *
   * - Access-Control-Allow-Origin: '*'
   *   Allows requests from any origin. Using '*' provides flexibility during development
   *   and testing, but be cautious in production as this setting permits access from all origins.
   * 
   * - Access-Control-Allow-Methods: 'GET,OPTIONS,POST'
   *   Specifies which HTTP methods are allowed. Here, GET, OPTIONS, and POST requests are enabled.
   *
   * - Access-Control-Allow-Headers: 'Content-Type, Authorization'
   *   Lists the allowed headers for requests. Content-Type is needed for sending JSON data, 
   *   and Authorization is required for secure endpoints using authorization tokens.
   * 
   * This configuration handles preflight requests automatically, responding with the appropriate
   * CORS headers, and is necessary to prevent browser errors when requests originate from 
   * different domains.
   */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,POST" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" }
        ]
      }
    ];
  }
};

export default nextConfig;