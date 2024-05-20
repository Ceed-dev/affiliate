import { WhitelistedAddress } from ".";

export type ProjectData = {
  id?: string;
  projectName: string;
  description: string;
  selectedTokenAddress: string;
  rewardAmount: number;
  redirectUrl: string;
  logo: string | null;
  cover: string | null;
  websiteUrl: string;
  discordUrl: string;
  xUrl: string;
  instagramUrl: string;
  ownerAddress: string;
  createdAt: Date;
  updatedAt: Date;
  totalPaidOut: number;
  lastPaymentDate: Date | null;
  whitelistedAddresses: { [address: string]: WhitelistedAddress };
  slots: {
    total: number;
    remaining: number;
  };
  budget: {
    total: number;
    remaining: number;
  };
  deadline: Date;
};