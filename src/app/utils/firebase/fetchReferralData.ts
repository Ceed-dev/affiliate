import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidReferralData } from "../validationUtils";
import { ReferralData } from "../../types";

export async function fetchReferralData(referralId: string): Promise<ReferralData> {
  const docRef = doc(db, "referrals", referralId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && isValidReferralData(docSnap.data())) {
      const data = docSnap.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
        tweetNewestCreatedAt?: Timestamp | null;
      };

      // Build the referral data, converting timestamps to Date objects where necessary
      const referralData: ReferralData = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        lastConversionDate: data.lastConversionDate?.toDate() || null,
        tweetNewestId: data.tweetNewestId || undefined,
        tweetNewestCreatedAt: data.tweetNewestCreatedAt ? data.tweetNewestCreatedAt.toDate() : undefined,
      };
      
      return referralData;
    } else {
      console.log("No such document or data validation failed!");
      throw new Error("Referral data not found or invalid");
    }
  } catch (error: any) {
    console.error("Error fetching referral data: ", error);
    throw new Error(`Failed to fetch referral data: ${error.message}`);
  }
}
