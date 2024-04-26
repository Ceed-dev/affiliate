import { db } from "./firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { ReferralData } from "../../types";
import { toast } from "react-toastify";

export async function createAndReturnNewReferralId(walletAddress: string, projectId: string): Promise<string> {
  const newReferral: ReferralData = {
    affiliateWallet: walletAddress,
    projectId: projectId,
    createdAt: new Date(),
    conversions: 0,
    earnings: 0,
    lastConversionDate: null
  };
  const referralDocRef = await addDoc(collection(db, "referrals"), newReferral);
  toast.success("Your referral link has been generated successfully!");
  return referralDocRef.id;
}