/**
 * Represents the data structure for a featured project in the app settings.
 */
export type FeaturedProjectData = {
  projectId: string | null;  // Allow null to indicate no featured project
  lastUpdated: Date;         // Timestamp of the last update to the featured project
};

/**
 * Represents the data structure for the marketplace banner in the app settings.
 */
export type MarketplaceBannerData = {
  message: string | null;    // Allow null to indicate no banner message
  lastUpdated: Date;         // Timestamp of the last update to the banner
};