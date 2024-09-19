import { doc, updateDoc } from "firebase/firestore"; 
import { db } from "./firebaseConfig";
import { ExtendedTweetEngagement } from "../../types";

export const updateTweetEngagement = async (tweetDataArray: ExtendedTweetEngagement[]) => {
  try {
    const updatePromises = tweetDataArray.map(async (tweetData) => {
      try {
        const referralDocRef = doc(db, "referrals", tweetData.referralId);
        
        // Update Firestore with the tweet engagement data
        await updateDoc(referralDocRef, {
          tweetEngagement: {
            retweetCount: tweetData.retweetCount,
            replyCount: tweetData.replyCount,
            likeCount: tweetData.likeCount,
            quoteCount: tweetData.quoteCount,
            bookmarkCount: tweetData.bookmarkCount,
            impressionCount: tweetData.impressionCount,
            fetchedAt: tweetData.fetchedAt,
          }
        });
      } catch (error) {
        throw new Error(`Error updating Firestore for referral ID: ${tweetData.referralId}`);
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    throw new Error("Failed to update Firestore with Tweet engagement data.");
  }
};
