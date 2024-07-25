import { collection, query, getDocs, where, DocumentData, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ReferralData, UnpaidConversionLog } from "../../types";
import { getChainByChainIdAsync, Chain } from "@thirdweb-dev/chains";

export const fetchAllUnpaidConversionLogs = async (): Promise<UnpaidConversionLog[]> => {
  try {
    const unpaidConversionLogs: UnpaidConversionLog[] = [];
    
    const referralsRef = collection(db, "referrals");
    const referralsSnapshot = await getDocs(referralsRef);
    
    const conversionLogPromises = referralsSnapshot.docs.map(async (referralDoc) => {
      const referralData = referralDoc.data() as ReferralData;
      const referralId = referralDoc.id;
      const affiliateWallet = referralData.affiliateWallet;
      const projectId = referralData.projectId;

      const projectDocRef = doc(db, `projects/${projectId}`);
      const projectDocSnap = await getDoc(projectDocRef);
      const projectData = projectDocSnap.data();
      const selectedChainId = projectData?.selectedChainId as number;
      const selectedChain = await getChainByChainIdAsync(selectedChainId) as Chain;
      const selectedTokenAddress = projectData?.selectedTokenAddress as string;

      const conversionLogsRef = collection(db, `referrals/${referralId}/conversionLogs`);
      const q = query(conversionLogsRef, where("isPaid", "==", false));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData & { timestamp: Timestamp };
        unpaidConversionLogs.push({
          logId: doc.id,
          timestamp: data.timestamp.toDate(),
          amount: data.amount,
          referralId,
          affiliateWallet,
          projectId,
          selectedChain,
          selectedTokenAddress,
        });
      });
    });

    await Promise.all(conversionLogPromises);

    console.log("Unpaid Conversion Logs: ", unpaidConversionLogs);
    return unpaidConversionLogs;
  } catch (error) {
    console.error("Error fetching unpaid conversion logs for referrals: ", error);
    throw new Error("Failed to fetch unpaid conversion logs for referrals");
  }
};
