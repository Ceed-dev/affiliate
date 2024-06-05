import { AffiliateInfo } from "./affiliateInfo";

export type UserData = AffiliateInfo & {
  walletAddress?: string;
  joinedProjectIds: string[];
  createdAt: Date;
  updatedAt: Date;
};