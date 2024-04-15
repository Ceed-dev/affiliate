import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

export async function getExistingReferralId(walletAddress: string, projectId: string): Promise<string> {
  try {
    const referralsCol = collection(db, "referrals");
    const q = query(referralsCol, 
                    where("affiliateWallet", "==", walletAddress),
                    where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    } else {
      toast.error("No referral ID found for your account.");
      throw new Error("No referral ID found for the given wallet address and project ID.");
    }
  } catch (error) {
    console.error("Error fetching existing referral ID: ", error);
    toast.error("Failed to fetch referral ID. Please try again.");
    throw new Error("Failed to fetch existing referral ID");
  }
}