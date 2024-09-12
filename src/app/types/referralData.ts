export type ReferralData = {
  id?: string;
  affiliateWallet: string;
  projectId: string;
  createdAt: Date;
  conversions: number;
  earnings: number;
  lastConversionDate: Date | null;
  tweetUrl?: string; // URL of the tweet shared by the affiliate
  tweetEngagement?: {
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    bookmarkCount: number;
    impressionCount: number;
    fetchedAt: Date; // Timestamp of when the data was fetched
  };
};