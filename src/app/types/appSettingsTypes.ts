/**
 * Represents the data structure for a featured project in the app settings.
 */
export type FeaturedProjectData = {
  projectId: string | null;  // Allow null to indicate no featured project
  lastUpdated: Date;
};