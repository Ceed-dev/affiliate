import { db } from "./firebaseConfig";
import { doc, updateDoc, increment } from "firebase/firestore";

export async function incrementClickCount(referralId: string): Promise<void> {
  const referralDocRef = doc(db, "referrals", referralId);
  try {
    await updateDoc(referralDocRef, {
      clicks: increment(1)
    });
    console.log("Click count incremented successfully!");
  } catch (error) {
    console.error("Failed to increment click count: ", error);
    throw error;
  }
}
