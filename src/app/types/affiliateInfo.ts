// Defines the role of the user in the system, either as a ProjectOwner or an Affiliate
export type UserRole = "ProjectOwner" | "Affiliate";

// Represents the information related to an affiliate user
export type AffiliateInfo = {
  username: string;                // The username of the affiliate user
  email: string;                   // The email address of the affiliate user
  role: UserRole;                  // The role of the user, either "ProjectOwner" or "Affiliate"
  projectUrl?: string;             // The URL of the project (required if the role is "ProjectOwner")
  xAuthToken?: XAuthToken;         // Optional: X authentication token data, if the user has connected an X account
  xAccountInfo?: XAccountInfo;     // Optional: X account information, if the user has connected an X account
};

// Token information returned after X OAuth authentication
export type XAuthToken = {
  token_type: string;      // Type of token, typically "bearer"
  access_token: string;    // Access token to authenticate API requests
  scope: string;           // Permissions granted by the token (e.g., "users.read tweet.read")
  refresh_token: string;   // Token used to refresh the access token when it expires
  expires_at: number;      // Expiration time of the access token in UNIX timestamp format
};

// Public metrics for the X account, providing follower and tweet-related counts
export type XPublicMetrics = {
  followers_count: number; // Number of followers the user has
  following_count: number; // Number of accounts the user is following
  tweet_count: number;     // Number of tweets the user has posted
  listed_count: number;    // Number of times the user has been added to lists
  like_count: number;      // Number of likes the user has received (if applicable)
};

// X account information, containing basic profile data and public metrics
export type XAccountInfo = {
  id: string;                     // Unique identifier for the X account
  verified: boolean;              // Indicates if the account is verified (has a blue checkmark)
  created_at: string;             // Date and time the account was created (ISO8601 format)
  username: string;               // Username of the account (e.g., "0xQube")
  location?: string;              // User's location (optional)
  description?: string;           // User's profile description (optional)
  public_metrics: XPublicMetrics; // Public metrics such as follower count, tweet count, etc.
  profile_image_url: string;      // URL of the user's profile image
  name: string;                   // User's display name (e.g., "Qube")
};

// Represents the engagement data for a specific tweet (public or private)
export type TweetMetrics = {
  retweetCount: number;        // Number of retweets
  replyCount: number;          // Number of replies
  likeCount: number;           // Number of likes
  quoteCount: number;          // Number of quotes
  bookmarkCount: number;       // Number of bookmarks
  impressionCount: number;     // Number of impressions (views)
};

// Represents a tweet document within the tweets subcollection
export type TweetData = {
  tweetId?: string;             // Unique identifier for the tweet
  tweetText: string;           // The content of the tweet
  tweetUrl: string;            // URL link to the tweet
  metrics: TweetMetrics;       // Engagement metrics (public or private)
  createdAt: Date;             // The date and time the tweet was created (ISO8601 format)
  firstFetchedAt: Date;        // The first time the tweet's engagement data was fetched
  lastFetchedAt: Date;         // The last time the engagement data was updated
  fetchCount: number;          // The number of times the engagement data has been fetched
};

/**
 * Represents the data required to update tweet engagement information.
 * Used when fetching and updating tweet engagement metrics for a user's tweets.
 */
export type TweetEngagementUpdate = {
  username: string;  // The username of the X account associated with the tweets.
  referralId: string;  // The referral ID linked to the affiliate's tweets.
  
  /**
   * An array of engagement data for past tweets.
   * This field is optional and contains historical tweet metrics.
   */
  pastTweetEngagementData?: any[]; // Engagement data for past tweets (optional).

  /**
   * An array of engagement data for recent tweets.
   * This field is optional and contains the latest tweet metrics.
   */
  recentTweetEngagementData?: any[]; // Engagement data for recent tweets (optional).
};