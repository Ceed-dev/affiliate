/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com", "pbs.twimg.com"],
  },
  /** 
   * Disabling React's Strict Mode.
   * This prevents React from rendering components twice in development mode, which 
   * can cause issues such as making API calls multiple times. It is safe to disable 
   * in production, but React recommends using it in development to catch potential problems.
   */
  reactStrictMode: false,
};

export default nextConfig;
