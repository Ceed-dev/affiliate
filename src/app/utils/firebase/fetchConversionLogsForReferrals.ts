import { collection, query, getDocs, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ConversionLog, ReferralData } from "../../types";

export const fetchConversionLogsForReferrals = async (referralData: ReferralData[], setConversionLogData: Function): Promise<void> => {
  try {
    const conversionLogs: ConversionLog[] = [];
    const conversionLogPromises = referralData.map(async (referral) => {
      const conversionLogsRef = collection(db, "referrals", `${referral.id}`, "conversionLogs");
      const q = query(conversionLogsRef);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData & { timestamp: Timestamp };
        conversionLogs.push({
          timestamp: data.timestamp.toDate(),
          amount: data.amount,
          isPaid: data.isPaid,
        });
      });
    });

    await Promise.all(conversionLogPromises);

    setConversionLogData(conversionLogs);
    console.log("Conversion Logs: ", conversionLogs);
  } catch (error) {
    console.error("Error fetching conversion logs for referrals: ", error);
    throw new Error("Failed to fetch conversion logs for referrals");
  }
};