/**
 * Defines the category of a campaign.
 */
export type CampaignCategory = "Standard" | "Kaia";

/**
 * Defines the available reward types.
 */
export type RewardType = "xp" | "token";

/**
 * Stores details about the rewards associated with a campaign.
 */
export type RewardDetails = {
  type: RewardType; // Type of reward (e.g., XP, token)
  unit: string; // Reward unit (e.g., USDC, XP)
  tokenAddress?: string | null; // Token contract address (optional for token rewards)
  chainId?: number | null; // Blockchain network ID (optional)
  metadata?: Record<string, any> | null; // Additional metadata (optional)
};

/**
 * Defines the role of a campaign member.
 */
export type MemberRole = "admin" | "editor" | "viewer"; // Future extensions: "finance", etc.

/**
 * Represents a member of a campaign with role and status information.
 */
export type CampaignMember = {
  role: MemberRole; // Member's role in the campaign
  joinedAt: Date | null; // Date the member joined
  invitedBy?: string; // User ID of the inviter (optional)
  status: "active" | "pending"; // Membership status
};

/**
 * Tracks click-related statistics.
 */
type ClickStats = {
  total: number;
  byCountry: Record<string, number>;
  byDay: Record<string, number>;
  byMonth: Record<string, number>;
  timestamps: {
    firstClickAt: Date | null;
    lastClickAt: Date | null;
  };
};

/**
 * Tracks conversion-related statistics.
 */
type ConversionStats = {
  total: number;
  byConversionPoint: Record<string, number>;
  byCountry: Record<string, number>;
  byDay: Record<string, number>;
  byMonth: Record<string, number>;
  timestamps: {
    firstConversionAt: Date | null;
    lastConversionAt: Date | null;
  };
};

/**
 * Tracks reward-related statistics.
 */
type RewardStats = {
  byRewardUnit: Record<string, {
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  }>;
  isPaid: { paidCount: number; unpaidCount: number };
  timestamps: {
    firstPaidAt: Date | null;
    lastPaidAt: Date | null;
  };
};

/**
 * Aggregated statistics for different affiliate types.
 */
type AggregatedStats = {
  activeAffiliatesCount: number;
  clickStats: ClickStats;
  conversionStats: ConversionStats;
  rewardStats: RewardStats;
};

/**
 * Stores aggregated statistics for both ASP and INDIVIDUAL affiliates.
 */
type AggregatedStatsData = {
  ASP: AggregatedStats;
  INDIVIDUAL: AggregatedStats;
};

/**
 * Defines the available reward types for conversion points.
 */
export type ConversionRewardType = "FixedAmount" | "RevenueShare" | "Tiered"; // RevenueShare & Tiered are currently unused

/**
 * Represents a conversion point within a campaign.
 */
export type ConversionPoint = {
  id: string; // Unique identifier for the conversion point
  title: string; // Description of the conversion point
  isActive: boolean; // Whether the conversion point is active
  rewardType: ConversionRewardType; // Type of reward associated with this conversion
  rewardId: string; // Identifier linking to a specific reward in rewards map: "default", etc.
  rewardDetails: {
    amount: number; // FixedAmount reward value (mandatory)
    // percentage?: number; // RevenueShare (currently unused)
    // tiers?: { conversionsRequired: number; rewardAmount: number }[]; // Tiered rewards (currently unused)
  };
};

/**
 * Defines the available versions of the conversion API.
 */
export type CapiVersion = "v1" | "v2";

/**
 * Specifies the type of affiliate participating in the campaign.
 */
export type AffiliateType = "ASP" | "INDIVIDUAL";

/**
 * Represents the possible statuses of a campaign.
 */
export type CampaignStatus = "active" | "paused" | "ended";

/**
 * Represents a campaign's core data structure.
 */
export type CampaignData = {
  id?: string; // Firestore document ID for the campaign
  name: string; // Name of the campaign
  description: string; // Detailed description of the campaign

  category: CampaignCategory; // Category of the campaign (e.g., Standard, Kaia)

  urls: {
    website: string;
    x: string;
    discord?: string;
    redirect: string;
  };

  images: {
    logo: string | null;
    cover: string | null;
  };

  rewards: Record<string, RewardDetails>; // Map of rewards by unique ID
  members: Record<string, CampaignMember>; // Map of campaign members by user ID
  aggregatedStats: AggregatedStatsData; // Aggregated statistics for the campaign
  conversionPoints: ConversionPoint[]; // List of conversion points associated with the campaign

  settings: {
    isVisibleOnMarketplace: boolean;
    capiVersion: CapiVersion;
    allowedAffiliateTypes: AffiliateType[];
  };

  targeting: {
    audienceCountries: string[];
  };

  status: CampaignStatus; // Current status of the campaign

  timestamps: {
    createdAt: Date; // Campaign creation timestamp
    updatedAt: Date; // Last update timestamp
  };
};