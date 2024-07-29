import { WhitelistedAddress } from ".";

export type PaymentType = "FixedAmount" | "RevenueShare" | "Tiered";

type BaseProjectData = {
  id?: string;
  projectName: string;
  description: string;
  selectedChainId: number;
  selectedTokenAddress: string;
  logo: string | null;
  cover: string | null;
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

export type EscrowPaymentProjectData = BaseProjectData & {
  projectType: "EscrowPayment";
  paymentType: PaymentType;
  paymentDetails: PaymentDetails;
  redirectUrl: string;
  totalPaidOut: number;
  lastPaymentDate: Date | null;
  embed: string | null;
};

export type ProjectData = DirectPaymentProjectData | EscrowPaymentProjectData;
