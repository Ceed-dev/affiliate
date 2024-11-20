export type PaymentType = "FixedAmount" | "RevenueShare" | "Tiered";

/**
 * Represents a reward tier for affiliates based on conversions.
 */
export type Tier = {
  conversionsRequired: number; // Number of conversions required for this tier
  rewardAmount: number; // Reward amount for reaching this tier
};

/**
 * Defines a conversion point with details on how affiliates are rewarded.
 */
export type ConversionPoint = {
  id: string; // Unique alphanumeric ID for the conversion point
  title: string; // Title describing the purpose of this conversion point
  paymentType: PaymentType; // Type of reward distribution: FixedAmount, RevenueShare, or Tiered
  rewardAmount?: number; // Reward amount (used when paymentType is FixedAmount)
  percentage?: number; // Revenue share percentage (used when paymentType is RevenueShare)
  tiers?: Tier[]; // Reward tiers (used when paymentType is Tiered)
  isActive: boolean; // Indicates if this conversion point is currently active
};

/**
 * Represents the selected token for a project, including its chain, address, and symbol.
 * This structure is used to store and access token-related information efficiently.
 */
export type SelectedToken = {
  chainId: number; // Chain ID where the token resides
  address: string; // Token contract address on the chain
  symbol: string;  // Human-readable token symbol (e.g., USDC, DAI)
};

/**
 * Main data structure for a project with details about setup, branding, and conversion points.
 */
export type ProjectData = {
  id?: string; // Project identifier, generated upon creation
  projectName: string; // Name of the project
  description: string; // Description of the project
  selectedToken: SelectedToken; // Information about the token used for affiliate payments (chainId, address, symbol)
  logo: File | string | null; // Project logo file or URL
  cover: File | string | null; // Project cover image file or URL
  websiteUrl: string; // Website URL associated with the project
  xUrl: string; // X (formerly Twitter) URL associated with the project
  discordUrl: string; // Discord URL associated with the project
  ownerAddresses: string[]; // Array of addresses that own or manage the project
  createdAt: Date; // Project creation date
  updatedAt: Date; // Project last updated date
  redirectUrl: string; // URL used for redirection in the project
  totalPaidOut: number; // Total amount paid out to affiliates
  lastPaymentDate: Date | null; // Date of the last payment made
  isReferralEnabled: boolean; // Indicates if the referral feature is enabled for the project
  conversionPoints: ConversionPoint[]; // List of conversion points for the project
  // ==============================================
  // DO NOT DELETE THIS!!
  // Purpose: This comment preserves the reference to the embed images feature, allowing us to track where related code existed.
  // Manages embed images feature for affiliates to select and display ads within projects.
  // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
  // Uncomment to re-enable the embed images feature in the future.
  // embeds: (File | string)[];
  // ==============================================
};