import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidReferralData } from "../validations";
import { ReferralData } from "../../types";

export async function fetchReferralData(referralId: string): Promise<ReferralData> {
  const docRef = doc(db, "referrals", referralId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && isValidReferralData(docSnap.data())) {
      const data = docSnap.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
        tweetEngagement?: {
          retweetCount: number;
          replyCount: number;
          likeCount: number;
          quoteCount: number;
          bookmarkCount: number;
          impressionCount: number;
          fetchedAt: Timestamp;
        }
      };

      // Build the referral data, converting timestamps to Date objects where necessary
      const referralData: ReferralData = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        lastConversionDate: data.lastConversionDate?.toDate() || null,
        tweetUrl: data.tweetUrl || "",
        tweetEngagement: data.tweetEngagement
          ? {
              ...data.tweetEngagement,
              fetchedAt: data.tweetEngagement.fetchedAt.toDate(), // Convert fetchedAt timestamp to Date
            }
          : undefined,
      };
      
      console.log("Referral data:", JSON.stringify(referralData, null, 2));
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
