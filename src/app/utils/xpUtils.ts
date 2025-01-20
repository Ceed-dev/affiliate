import { db } from "./firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore"; // Firestore functions for document retrieval
import { toast } from "react-toastify"; // Toast for error message display
import { fetchReferralPerformanceByProjectId } from "./referralUtils";

type ImpressionTier = {
  threshold: number; // Tier threshold for impressions
  points: number;    // Points awarded for meeting the threshold
};

/**
 * Calculates the total XP points for a user based on their joined projects.
 * 
 * This function fetches XP point configurations for each project, retrieves referral data,
 * and calculates the total XP points using tweet posts, impressions, and clicks.
 * 
 * @param joinedProjectIds - An array of project IDs that the user has joined.
 * @param walletAddress - The wallet address of the user.
 * @returns {Promise<number>} - The total XP points calculated for the user.
 */
export const calculateTotalXpPoints = async (
  joinedProjectIds: string[],
  walletAddress: string
): Promise<number> => {
  try {
    let totalXpPoints = 0; // Initialize the total XP points

    // Iterate over each project ID
    for (const projectId of joinedProjectIds) {
      // Fetch XP points configuration for the project
      const xpConfigDocRef = doc(db, "xpPointsConfig", projectId);
      const xpConfigDoc = await getDoc(xpConfigDocRef);

      if (!xpConfigDoc.exists()) {
        console.warn(`No XP points config found for project ID: ${projectId}`);
        continue; // Skip the current project if no config is found
      }

      const xpConfig = xpConfigDoc.data();

      // Points awarded per tweet post
      const xPostPoints = xpConfig.xPost ?? 0;

      // Impression tiers for calculating points based on impression count
      const impressionTiers: ImpressionTier[] = xpConfig.impTiers ?? [];
      // Sort tiers in descending order by threshold
      impressionTiers.sort((a: ImpressionTier, b: ImpressionTier) => b.threshold - a.threshold);

      // Points awarded per click
      const clickPoints = xpConfig.click ?? 0;

      // Fetch referral data for the current project and wallet address
      const referrals = await fetchReferralPerformanceByProjectId(projectId, walletAddress);

      // Use only the first referral data if it exists
      const referral = referrals[0];

      if (referral) {
        // Calculate points from tweet posts
        const tweetCount = referral.tweets?.length || 0;
        totalXpPoints += tweetCount * xPostPoints;

        // Calculate points from impressions
        if (referral.tweets) {
          referral.tweets.forEach((tweet) => {
            const impressionCount = tweet.metrics?.impressionCount || 0;

            // Add points based on the impression count and tiers
            const points = calculateImpressionPoints(impressionCount, impressionTiers);
            totalXpPoints += points;
          });
        }

        // Calculate points from clicks
        const clicksCount = referral.clicks.length;
        totalXpPoints += clicksCount * clickPoints;
      } else {
        console.warn(`No referral data found for project ID: ${projectId} and wallet address: ${walletAddress}`);
      }
    }

    return totalXpPoints;
  } catch (error) {
    console.error("Error calculating XP points:", error);
    toast.error("Failed to calculate XP points. Please try again later.");
    return 0; // Return 0 in case of an error
  }
};

/**
 * Calculates points based on the impression count and tiers.
 * 
 * This function compares the impression count against the configured tiers and
 * returns the corresponding points for the highest matching threshold.
 * 
 * @param impressionCount - The total number of impressions.
 * @param tiers - Array of impression tiers with thresholds and points.
 * @returns {number} - Points corresponding to the impression count.
 */
export const calculateImpressionPoints = (
  impressionCount: number, 
  tiers: { threshold: number; points: number }[]
): number => {
  for (const tier of tiers) {
    if (impressionCount >= tier.threshold) {
      return tier.points;
    }
  }
  return 0; // Default to 0 points if no tier matches
};