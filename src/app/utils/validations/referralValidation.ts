import { DocumentData } from "firebase/firestore";
import { ReferralData } from "../../types";

export function isValidReferralData(data: DocumentData): data is ReferralData {
  return (
    typeof data.affiliateWallet === "string" &&
    typeof data.projectId === "string" &&
    data.createdAt.toDate() instanceof Date &&
    typeof data.conversions === "number" &&
    typeof data.earnings === "number" &&
    (data.lastConversionDate === null || data.lastConversionDate.toDate() instanceof Date) &&
    (typeof data.tweetUrl === "undefined" || typeof data.tweetUrl === "string") &&
    (typeof data.tweetEngagement === "undefined" || (
      typeof data.tweetEngagement.retweetCount === "number" &&
      typeof data.tweetEngagement.replyCount === "number" &&
      typeof data.tweetEngagement.likeCount === "number" &&
      typeof data.tweetEngagement.quoteCount === "number" &&
      typeof data.tweetEngagement.bookmarkCount === "number" &&
      typeof data.tweetEngagement.impressionCount === "number" &&
      data.tweetEngagement.fetchedAt.toDate() instanceof Date
    ))
  );
}