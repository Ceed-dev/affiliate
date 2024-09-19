import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const fetchAllReferralIds = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "referrals"));
    const referralIds = querySnapshot.docs.map((doc) => doc.id);
    return referralIds;
  } catch (error) {
    console.error("Failed to fetch referral IDs:", error);
    throw new Error("Failed to fetch referral IDs");
  }
};
