import { WhitelistedAddress } from ".";

export type ProjectType = "DirectPayment" | "EscrowPayment";
export type PaymentType = "FixedAmount" | "RevenueShare" | "Tiered";

type BaseProjectData = {
  id?: string;
  projectName: string;
  description: string;
  selectedChainId: number;
  selectedTokenAddress: string;
  logo: File | string | null;
  cover: File | string | null;
  websiteUrl: string;
  xUrl: string;
  discordUrl: string;
  ownerAddresses: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type DirectPaymentProjectData = BaseProjectData & {
  projectType: "DirectPayment";
  whitelistedAddresses: { [address: string]: WhitelistedAddress };
  slots: {
    total: number;
    remaining: number;
  };
  budget: {
    total: number;
    remaining: number;
  };
  deadline: Date | null;
};

export type Tier = {
  conversionsRequired: number;
  rewardAmount: number;
};

export type ConversionPoint = {
  id: string; // Stores the automatically generated alphanumeric ID
  title: string; // Title to indicate the purpose of the conversion point
  paymentType: PaymentType; // Type of reward distribution
  rewardAmount?: number; // Used when the reward type is FixedAmount
  percentage?: number; // Used when the reward type is RevenueShare
  tiers?: Tier[]; // Used when the reward type is Tiered
  isActive: boolean; // Indicates whether this conversion point is currently active
};

export type EscrowPaymentProjectData = BaseProjectData & {
  projectType: "EscrowPayment";
  redirectUrl: string;
  totalPaidOut: number;
  lastPaymentDate: Date | null;
  // ==============================================
  // This code manages the embed images feature for affiliates to select and display ads within projects.
  // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
  // Uncomment to re-enable the embed images feature in the future.
  // embeds: (File | string)[];
  // ==============================================
  isReferralEnabled: boolean;
  conversionPoints: ConversionPoint[];
};

export type ProjectData = DirectPaymentProjectData | EscrowPaymentProjectData;
