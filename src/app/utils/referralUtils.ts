import { doc, collection, query, where, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { fetchUserById } from "./userUtils";
import { isValidReferralData } from "./validationUtils";
import { ReferralData, ClickData, ConversionLog, AffiliatePerformanceData } from "../types/referralTypes";
import { TweetData, YouTubeVideoData } from "../types/affiliateInfo";

/**
 * fetches all affiliate performance data for a specific campaign (new specification).
 *
 * @returns {promise<{clicks: clickdata[], conversions: conversionlog[]}>} - aggregated affiliate data.
 */
export async function fetchCampaignPerformanceBylCampaignId(
): Promise<{clicks: ClickData[], conversions: ConversionLog[]}> {
  const performs: {clicks: ClickData[], conversions: ConversionLog[]} = {clicks: [], conversions: []};

  try {
    // ASP
    const aspClickLogsRef = collection(db, "aspCampaignLinks/rCs8QJxuPn5MD51GO2hH/clickLogs");
    const aspClickLogsSnap = await getDocs(aspClickLogsRef);

    for (const doc of aspClickLogsSnap.docs) {
      const data = doc.data();
      performs.clicks.push({
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        ip: data.location.ip,
        country: data.location.country,
        region: data.location.region,
        city: data.location.city,
        userAgent: data.userAgent,
      });
    }

    const aspConversionLogsRef = collection(db, "aspCampaignLinks/rCs8QJxuPn5MD51GO2hH/conversionLogs");
    const aspConversionLogsSnap = await getDocs(aspConversionLogsRef);

    for (const doc of aspConversionLogsSnap.docs) {
      const data = doc.data();
      performs.conversions.push({
        id: doc.id,
        timestamp: data.timestamps.createdAt.toDate(),
        amount: data.finalRewardDetails.amount,
        conversionId: data.ids.conversionId,
        isPaid: data.isPaid,
      });
    }

    // Individual
    const clickLogsRef = collection(db, "individualCampaignLinks/Ya5KzF5Unqvb78fX6kzd/clickLogs");
    const clickLogsSnap = await getDocs(clickLogsRef);

    for (const doc of clickLogsSnap.docs) {
      const data = doc.data();
      performs.clicks.push({
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        ip: data.location.ip,
        country: data.location.country,
        region: data.location.region,
        city: data.location.city,
        userAgent: data.userAgent,
      });
    }

    const conversionLogsRef = collection(db, "individualCampaignLinks/Ya5KzF5Unqvb78fX6kzd/conversionLogs");
    const conversionLogsSnap = await getDocs(conversionLogsRef);

    for (const doc of conversionLogsSnap.docs) {
      const data = doc.data();
      performs.conversions.push({
        id: doc.id,
        timestamp: data.timestamps.createdAt.toDate(),
        amount: data.finalRewardDetails.amount,
        conversionId: data.ids.conversionId,
        isPaid: data.isPaid,
      });
    }

    return performs;
  } catch (error) {
    console.error("Error fetching campaign referral performance:", error);
    throw new Error("Failed to fetch campaign performance data.");
  }
}

/**
 * Fetches all referrals for a specific project and optionally filters by affiliate wallet,
 * including user data, click data, conversion data, tweet data, and YouTube video data.
 *
 * @param {string} projectId - The ID of the project to fetch referrals for.
 * @param {string} [affiliateWallet] - Optional wallet address of the affiliate to filter referrals.
 * @returns {Promise<AffiliatePerformanceData[]>} - A promise resolving to an array of affiliate performance data.
 * 
 * This function retrieves referral documents associated with a specified project from Firestore.
 * For each referral, it fetches user information, click data, conversion data, tweet data, and YouTube video data.
 */
export async function fetchReferralPerformanceByProjectId(
  projectId: string,
  affiliateWallet?: string,
): Promise<AffiliatePerformanceData[]> {
  const referrals: AffiliatePerformanceData[] = [];

  try {
    // Base query for referrals collection by project ID
    let q = query(collection(db, "referrals"), where("projectId", "==", projectId));

    // Add affiliate wallet filter if provided
    if (affiliateWallet) {
      q = query(q, where("affiliateWallet", "==", affiliateWallet));
    }

    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
        tweetNewestCreatedAt?: Timestamp | null;
      };

      // Process the referral data only if it is valid
      if (isValidReferralData(data)) {
        // Fetch user information for each referral
        const userData = await fetchUserById(data.affiliateWallet);
        const username = userData ? userData.username : "Unknown";

        // Determine the profile Image URL based on available data
        let profileImageUrl: string | undefined = undefined;

        if (userData?.xAccountInfo?.profile_image_url) {
          // Use X profile image URL if available
          profileImageUrl = userData.xAccountInfo.profile_image_url;
        } else if (userData?.youtubeAccountInfo?.snippet?.thumbnails?.high?.url) {
          // Use YouTube profile image URL (high resolution) if available
          profileImageUrl = userData.youtubeAccountInfo.snippet.thumbnails.high.url;
        } else if (userData?.youtubeAccountInfo?.snippet?.thumbnails?.medium?.url) {
          // Use YouTube profile image URL (medium resolution) as fallback
          profileImageUrl = userData.youtubeAccountInfo.snippet.thumbnails.medium.url;
        } else if (userData?.youtubeAccountInfo?.snippet?.thumbnails?.default?.url) {
          // Use YouTube profile image URL (default resolution) as final fallback
          profileImageUrl = userData.youtubeAccountInfo.snippet.thumbnails.default.url;
        }

        // Fetch click data, conversion data, tweet data, and YouTube video data associated with the referral
        const clicksData = await fetchClickDataByReferralId(docSnapshot.id);
        const conversionsData = await fetchConversionLogDataByReferralId(docSnapshot.id);
        const tweetsData = await fetchTweetsByReferralId(docSnapshot.id);
        const youtubeVideosData = await fetchYouTubeVideosByReferralId(docSnapshot.id);

        // Construct affiliate performance data including clicks, conversions, tweets, videos, and user info
        const referralData: AffiliatePerformanceData = {
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt.toDate(),
          lastConversionDate: data.lastConversionDate?.toDate() || null,
          username,
          clicks: clicksData,
          tweets: tweetsData,
          youtubeVideos: youtubeVideosData,
          conversionLogs: conversionsData,
          tweetNewestId: data.tweetNewestId || undefined,
          tweetNewestCreatedAt: data.tweetNewestCreatedAt ? data.tweetNewestCreatedAt.toDate() : undefined,
          ...(profileImageUrl ? { profileImageUrl } : {}),  // Conditionally add profileImageUrl if it exists
        };
        referrals.push(referralData);
      }
    }

    return referrals;
  } catch (error) {
    console.error("Error fetching referrals by projectId: ", error);
    throw new Error("Failed to fetch referrals by projectId");
  }
}

/**
 * Fetches click data associated with a specific referral ID.
 *
 * @param {string} referralId - The ID of the referral for which to fetch click data.
 * @returns {Promise<ClickData[]>} - A promise resolving to an array of click data for the specified referral.
 */
async function fetchClickDataByReferralId(referralId: string): Promise<ClickData[]> {
  const clicksRef = collection(db, `referrals/${referralId}/clicks`);
  const clicksSnapshot = await getDocs(clicksRef);

  return clicksSnapshot.docs.map((doc) => {
    const clickData = doc.data();
    return {
      id: doc.id,
      timestamp: clickData.timestamp.toDate(),
      ip: clickData.ip || "Unknown",
      country: clickData.country || "Unknown",
      region: clickData.region || "Unknown",
      city: clickData.city || "Unknown",
      userAgent: clickData.userAgent || "Unknown",
      referralId,  // Directly include the referral ID (used in "WorldHeatmap" component)
    } as ClickData;
  });
}

/**
 * Fetches conversion log data associated with a specific referral ID.
 *
 * @param {string} referralId - The ID of the referral for which to fetch conversion log data.
 * @returns {Promise<ConversionLog[]>} - A promise resolving to an array of conversion logs for the specified referral.
 * 
 * This function retrieves all conversion log documents within the "conversionLogs" subcollection
 * of a referral document in Firestore, and returns them in a structured format.
 */
async function fetchConversionLogDataByReferralId(referralId: string): Promise<ConversionLog[]> {
  const conversionsRef = collection(db, `referrals/${referralId}/conversionLogs`);
  const conversionsSnapshot = await getDocs(conversionsRef);

  return conversionsSnapshot.docs.map((doc) => {
    const conversionData = doc.data();
    return {
      id: doc.id,
      timestamp: conversionData.timestamp.toDate(),
      amount: conversionData.amount,
      conversionId: conversionData.conversionId,
      isPaid: conversionData.isPaid,
      transactionHashAffiliate: conversionData.transactionHashAffiliate,
      paidAt: conversionData.paidAt ? conversionData.paidAt.toDate() : undefined,
      userWalletAddress: conversionData.userWalletAddress || undefined,
    } as ConversionLog;
  });
}

/**
 * Fetches tweet data associated with a specific referral ID.
 *
 * @param {string} referralId - The ID of the referral for which to fetch tweet data.
 * @returns {Promise<TweetData[]>} - A promise resolving to an array of tweet data for the specified referral.
 */
async function fetchTweetsByReferralId(referralId: string): Promise<TweetData[]> {
  const tweetsRef = collection(db, `referrals/${referralId}/tweets`);
  const tweetsSnapshot = await getDocs(tweetsRef);

  return tweetsSnapshot.docs.map((doc) => {
    const tweetData = doc.data();
    return {
      tweetId: doc.id,
      tweetText: tweetData.tweetText,
      tweetUrl: tweetData.tweetUrl,
      metrics: tweetData.metrics,
      createdAt: tweetData.createdAt.toDate(),
      firstFetchedAt: tweetData.firstFetchedAt.toDate(),
      lastFetchedAt: tweetData.lastFetchedAt.toDate(),
      fetchCount: tweetData.fetchCount,
    } as TweetData;
  });
}

/**
 * Fetches YouTube video data associated with a specific referral ID.
 *
 * @param {string} referralId - The ID of the referral for which to fetch YouTube video data.
 * @returns {Promise<YouTubeVideoData[]>} - A promise resolving to an array of YouTube video data for the specified referral.
 */
async function fetchYouTubeVideosByReferralId(referralId: string): Promise<YouTubeVideoData[]> {
  const youtubeVideosRef = collection(db, `referrals/${referralId}/youtubeVideos`);
  const youtubeVideosSnapshot = await getDocs(youtubeVideosRef);

  return youtubeVideosSnapshot.docs.map((doc) => {
    const videoData = doc.data();
    return {
      videoId: doc.id,
      title: videoData.title,
      description: videoData.description,
      statistics: videoData.statistics,
      thumbnails: videoData.thumbnails,
      publishedAt: videoData.publishedAt.toDate(),
      fetchCount: videoData.fetchCount,
      lastFetchedAt: videoData.lastFetchedAt.toDate(),
    } as YouTubeVideoData;
  });
}
