// Defines the role of the user in the system, either as a ProjectOwner or an Affiliate
export type UserRole = "ProjectOwner" | "Affiliate";

// Represents the information related to an affiliate user
export type AffiliateInfo = {
  username: string;                        // The username of the affiliate user
  email: string;                           // The email address of the affiliate user
  role: UserRole;                          // The role of the user, either "ProjectOwner" or "Affiliate"
  projectUrl?: string;                     // The URL of the project (required if the role is "ProjectOwner")
  audienceCountry?: string;                // Optional: The country of the affiliate's target audience
  xAuthToken?: XAuthToken;                 // Optional: X authentication token data, if the user has connected an X account
  xAccountInfo?: XAccountInfo;             // Optional: X account information, if the user has connected an X account
  googleAuthToken?: GoogleAuthToken;       // Optional: Google authentication token data, if the user has connected a Google account
  youtubeAccountInfo?: YouTubeAccountInfo; // Optional: YouTube account information, if available
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
  tweetId?: string;            // Unique identifier for the tweet
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

// Token information returned after Google OAuth authentication
export type GoogleAuthToken = {
  access_token: string;      // Access token used to authenticate API requests
  refresh_token: string;     // Token used to refresh the access token when it expires
  scope: string;             // Permissions granted by the token (e.g., "https://www.googleapis.com/auth/youtube.readonly")
  token_type: string;        // Type of token, typically "Bearer"
  expiry_date: number;       // Expiration time of the access token in UNIX timestamp format
};

// YouTube account information, containing channel details
export type YouTubeAccountInfo = {
  kind: string;                     // Type of resource ("youtube#channel")
  etag: string;                     // ETag of the resource
  id: string;                       // Unique identifier for the YouTube channel
  snippet?: {
    title: string;                  // Title of the YouTube channel
    description: string;            // Description of the YouTube channel
    customUrl?: string;             // Custom URL of the YouTube channel
    publishedAt: string;            // The date and time the channel was created (ISO8601 format)
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    localized?: {
      title: string;                // Localized title of the YouTube channel
      description: string;          // Localized description of the YouTube channel
    };
  };
  contentDetails?: {
    relatedPlaylists: {
      likes?: string;               // Playlist ID of the user's liked videos
      uploads: string;              // Playlist ID of the user's uploaded videos
    };
  };
  statistics?: {
    viewCount: string;              // Total views of the channel
    subscriberCount: string;        // Number of subscribers
    hiddenSubscriberCount: boolean; // Indicates if the subscriber count is hidden
    videoCount: string;             // Total number of videos uploaded by the user
  };
};

// Represents engagement statistics for a specific YouTube video
export type YouTubeVideoStatistics = {
  commentCount: number;         // Number of comments on the video
  dislikeCount: number;         // Number of dislikes on the video
  favoriteCount: number;        // Number of times the video has been favorited
  likeCount: number;            // Number of likes on the video
  viewCount: number;            // Number of views on the video
};

// Represents details of a thumbnail image for a YouTube video at a specific resolution
export type YouTubeThumbnail = {
  url: string;                  // URL of the thumbnail image
  width: number;                // Width of the thumbnail image in pixels
  height: number;               // Height of the thumbnail image in pixels
};

// Represents the set of available thumbnail images for a YouTube video at different resolutions
export type YouTubeThumbnails = {
  default: YouTubeThumbnail;    // Default resolution thumbnail
  medium: YouTubeThumbnail;     // Medium resolution thumbnail
  high: YouTubeThumbnail;       // High resolution thumbnail
};

// Represents a YouTube video document within the youtubeVideos subcollection in Firestore
export type YouTubeVideoData = {
  videoId?: string;                  // Unique identifier for the YouTube video
  title: string;                     // Title of the video
  description: string;               // Description of the video
  statistics: YouTubeVideoStatistics; // Engagement statistics for the video
  thumbnails: YouTubeThumbnails;     // Thumbnails of the video in various resolutions
  publishedAt: Date;                 // Date and time the video was published
  fetchCount: number;                // Number of times the engagement data has been fetched
  lastFetchedAt: Date;               // The last time the engagement data was updated
};