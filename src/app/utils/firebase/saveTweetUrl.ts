import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { toast } from "react-toastify";

/**
 * Saves the tweet URL to the referral document in Firestore.
 * @param referralId - The referral ID to update with the tweet URL.
 * @param tweetUrl - The tweet URL to save.
 */
export async function saveTweetUrl(referralId: string, tweetUrl: string): Promise<void> {
  try {
    const referralDocRef = doc(db, "referrals", referralId);
    await updateDoc(referralDocRef, { tweetUrl });
    toast.success("Tweet URL saved to Firestore successfully!");
  } catch (error: any) {
    console.error("Error saving tweet URL: ", error);
    toast.error(`Failed to save tweet URL: ${error.message}`);
    throw new Error("Failed to save tweet URL.");
  }
}
