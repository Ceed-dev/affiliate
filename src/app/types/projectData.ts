import { WhitelistedAddress } from ".";

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

export type FixedAmountDetails = {
  rewardAmount: number;
};

export type RevenueShareDetails = {
  percentage: number;
};

export type Tier = {
  conversionsRequired: number;
  rewardAmount: number;
};

export type TieredDetails = {
  tiers: Tier[];
};

export type PaymentDetails = FixedAmountDetails | RevenueShareDetails | TieredDetails;

export type ConversionPoint = {
  id: string; // Stores the automatically generated alphanumeric ID
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
  embeds: (File | string)[];
  isReferralEnabled: boolean;
  conversionPoints: ConversionPoint[];
};

export type ProjectData = DirectPaymentProjectData | EscrowPaymentProjectData;
