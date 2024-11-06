import { TweetData, YouTubeVideoData } from "./affiliateInfo";

// Type for storing basic referral-related information
export type ReferralData = {
  id?: string;                    // Optional unique identifier for the referral
  affiliateWallet: string;        // Wallet address of the affiliate
  projectId: string;              // Project ID associated with the referral
  createdAt: Date;                // Date and time when the referral was created
  conversions: number;            // Total number of conversions attributed to this referral
  earnings: number;               // Total earnings generated from this referral
  lastConversionDate: Date | null; // Date of the last conversion, or null if none
  tweetNewestId?: string;         // Optional: ID of the latest tweet associated with the affiliate's referral activity
  tweetNewestCreatedAt?: Date;    // Optional: Timestamp of the newest tweet
};

// Type for storing conversion log details
export type ConversionLog = {
  id?: string;                    // Optional unique identifier for the conversion log
  timestamp: Date;                // Date and time of the conversion
  amount: number;                 // Amount associated with the conversion
  conversionId: string;           // Unique identifier for the conversion
  isPaid: boolean;                // Status indicating if the conversion has been paid
  transactionHashAffiliate?: string; // Optional transaction hash for affiliate payment
  paidAt?: Date;                  // Optional date when the payment was made
  userWalletAddress?: string;     // Optional wallet address of the user involved in the conversion
};

// Type for storing individual click details
export type ClickData = {
  id?: string;                    // Optional unique identifier for the click
  timestamp: Date;                // Date and time when the click occurred
  ip: string;                     // IP address of the click source
  country: string;                // Country from which the click originated
  region: string;                 // Region from which the click originated
  city: string;                   // City from which the click originated
  userAgent: string;              // User agent information of the click source
  referralId?: string;            // Optional referral ID to track the source of the click (used in "WorldHeatmap" component)
};

// Type representing comprehensive performance data for an affiliate, including username, click data, conversion data, and social media engagement metrics.
export type AffiliatePerformanceData = ReferralData & {
  username: string;                     // Username of the affiliate
  clicks: ClickData[];                  // Array of click data associated with the referral
  conversionLogs: ConversionLog[];      // Array of conversion log entries tracking each successful conversion
  tweets?: TweetData[];                 // Optional array of tweet engagement data associated with the affiliate
  youtubeVideos?: YouTubeVideoData[];   // Optional array of YouTube video engagement data associated with the affiliate
};

// Extended type with aggregated fields for earnings and conversions
export type AggregatedAffiliatePerformanceData = AffiliatePerformanceData & {
  aggregatedEarnings: number;           // Total earnings aggregated from all conversion logs
  aggregatedConversionLogs: number;     // Total count of conversion logs
};