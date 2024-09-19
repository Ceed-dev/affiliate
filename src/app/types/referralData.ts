// TweetEngagement type for storing engagement data of tweets
export type TweetEngagement = {
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  bookmarkCount: number;
  impressionCount: number;
  fetchedAt: Date; // Timestamp of when the data was fetched
}

// ExtendedTweetEngagement type for storing additional referral info
export type ExtendedTweetEngagement = TweetEngagement & {
  referralId: string;
  tweetUrl: string;
};

// ReferralData type for storing referral-related information
export type ReferralData = {
  id?: string;
  affiliateWallet: string;
  projectId: string;
  createdAt: Date;
  conversions: number;
  earnings: number;
  lastConversionDate: Date | null;
  tweetUrl?: string; // URL of the tweet shared by the affiliate
  tweetEngagement?: TweetEngagement; // Tweet engagement data linked to the referral
};