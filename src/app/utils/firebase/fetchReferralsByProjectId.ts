import { collection, query, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidReferralData } from "../validations";
import { ReferralData } from "../../types";

export async function fetchReferralsByProjectId(projectId: string): Promise<ReferralData[]> {
  const referrals: ReferralData[] = [];
  try {
    const q = query(collection(db, "referrals"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate: Timestamp | null;
      };
      if (isValidReferralData(data) && data.projectId === projectId) {
        const referralData = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          lastConversionDate: data.lastConversionDate ? data.lastConversionDate.toDate() : null
        } as ReferralData;
        referrals.push(referralData);
      }
    });

    return referrals;
  } catch (error) {
    console.error("Error fetching referrals by projectId: ", error);
    throw new Error("Failed to fetch referrals by projectId");
  }
}
