// ReferralData type for storing referral-related information
export type ReferralData = {
  id?: string;
  affiliateWallet: string;
  projectId: string;
  createdAt: Date;
  conversions: number;
  earnings: number;
  lastConversionDate: Date | null;
  tweetNewestId?: string;          // Optional: X newest tweet ID associated with the affiliate's tweets
  tweetNewestCreatedAt?: Date;     // Optional: The date and time of the newest tweet
};