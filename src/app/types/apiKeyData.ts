export type ApiKeyData = {
  projectId?: string;       // Project ID
  apiKey: string;           // API key
  createdAt: Date;          // Creation date
  updatedAt: Date;          // Last update date
  lastUsedAt: Date | null;  // Last used date
  usageCount: number;       // Usage count
  isActive: boolean;        // API Key active status
};
