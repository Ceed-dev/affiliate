import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidReferralData } from "../validations";
import { ReferralData } from "../../types";

export async function fetchReferralsByProjectId(projectId: string): Promise<ReferralData[]> {
  const referrals: ReferralData[] = [];
  try {
    const q = query(collection(db, "referrals"), where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
      };
      if (isValidReferralData(data)) {
        const referralData: ReferralData = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          lastConversionDate: data.lastConversionDate?.toDate() || null,
        };
        referrals.push(referralData);
      }
    });

    return referrals;
  } catch (error) {
    console.error("Error fetching referrals by projectId: ", error);
    throw new Error("Failed to fetch referrals by projectId");
  }
}
