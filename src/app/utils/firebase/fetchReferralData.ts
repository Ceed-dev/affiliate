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
      };
      const referralData: ReferralData = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        lastConversionDate: data.lastConversionDate?.toDate() || null,
      };
      console.log("Document data:", JSON.stringify(referralData, null, 2));
      return referralData;
    } else {
      console.log("No such document or data is invalid!");
      throw new Error("No such referral or data validation failed");
    }
  } catch (error) {
    console.error("Error fetching referral data: ", error);
    throw new Error("Failed to fetch referral");
  }
}
