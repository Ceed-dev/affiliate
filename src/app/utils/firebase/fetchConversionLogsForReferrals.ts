import { collection, query, where, getDocs, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ConversionLog, ReferralData } from "../../types";

export const fetchConversionLogsForReferrals = async (
  referralData: ReferralData[], 
  setConversionLogData?: Function,
  conversionId?: string,
): Promise<ConversionLog[]> => {
  try {
    const conversionLogs: ConversionLog[] = [];
    const conversionLogPromises = referralData.map(async (referral) => {
      const conversionLogsRef = collection(db, "referrals", `${referral.id}`, "conversionLogs");
      
      // If conversionId is specified, only logs that match that ID will be retrieved.
      const q = conversionId
        ? query(conversionLogsRef, where("conversionId", "==", conversionId))
        : query(conversionLogsRef);

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData & { timestamp: Timestamp };
        conversionLogs.push({
          timestamp: data.timestamp.toDate(),
          amount: data.amount,
          conversionId: data.conversionId,
          isPaid: data.isPaid,
        });
      });
    });

    await Promise.all(conversionLogPromises);

    if (setConversionLogData) {
      setConversionLogData(conversionLogs);
    }
    console.log("Conversion Logs: ", conversionLogs);
    return conversionLogs;
  } catch (error) {
    console.error("Error fetching conversion logs for referrals: ", error);
    throw new Error("Failed to fetch conversion logs for referrals");
  }
};