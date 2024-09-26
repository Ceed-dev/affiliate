import { DocumentData } from "firebase/firestore";
import { ReferralData } from "../../types";

/**
 * Validates if the given Firestore document data conforms to the ReferralData type.
 * 
 * @param data - Firestore document data
 * @returns {boolean} - Returns true if the data is a valid ReferralData object, otherwise false.
 */
export function isValidReferralData(data: DocumentData): data is ReferralData {
  return (
    typeof data.affiliateWallet === "string" && // Validate affiliate's wallet address
    typeof data.projectId === "string" &&       // Validate project ID
    data.createdAt.toDate() instanceof Date &&  // Validate creation date
    typeof data.conversions === "number" &&     // Validate conversions count
    typeof data.earnings === "number" &&        // Validate earnings amount
    (data.lastConversionDate === null || data.lastConversionDate.toDate() instanceof Date) && // Validate last conversion date
    // Validate tweetUrl if present, it must be a string
    (typeof data.tweetUrl === "undefined" || typeof data.tweetUrl === "string") &&
    // Validate tweetEngagement object if present
    (typeof data.tweetEngagement === "undefined" || (
      typeof data.tweetEngagement.retweetCount === "number" &&
      typeof data.tweetEngagement.replyCount === "number" &&
      typeof data.tweetEngagement.likeCount === "number" &&
      typeof data.tweetEngagement.quoteCount === "number" &&
      typeof data.tweetEngagement.bookmarkCount === "number" &&
      typeof data.tweetEngagement.impressionCount === "number" &&
      data.tweetEngagement.fetchedAt.toDate() instanceof Date // Validate the fetchedAt date
    ))
  );
}
