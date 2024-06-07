import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidReferralData } from "../validations";
import { ReferralData, ExtendedReferralData, UserData } from "../../types";

export async function fetchReferralsByProjectId(projectId: string): Promise<ExtendedReferralData[]> {
  const referrals: ExtendedReferralData[] = [];
  try {
    const q = query(collection(db, "referrals"), where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
      };

      if (isValidReferralData(data)) {
        const userDocRef = doc(db, "users", data.affiliateWallet);
        const userDocSnapshot = await getDoc(userDocRef);

        let username = "";
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data() as UserData;
          username = userData.username;
        }

        const referralData: ExtendedReferralData = {
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt.toDate(),
          lastConversionDate: data.lastConversionDate?.toDate() || null,
          username,
        };
        referrals.push(referralData);
      }
    }

    return referrals;
  } catch (error) {
    console.error("Error fetching referrals by projectId: ", error);
    throw new Error("Failed to fetch referrals by projectId");
  }
}
