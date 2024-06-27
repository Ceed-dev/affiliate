import { AffiliateInfo } from "./affiliateInfo";

export type UserData = AffiliateInfo & {
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  allowed: boolean;
  joinedProjectIds?: string[]; // Optional, only for Affiliates
};