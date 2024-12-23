import { collection, query, getDocs, where, DocumentData, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ReferralData, UnpaidConversionLog } from "../../types";
import { Chain } from "thirdweb/chains";
import { getChains } from "../../utils/contracts";

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
      const selectedChainId = projectData?.selectedToken?.chainId as number;
      const selectedChain = getChains().find((chain) => chain.id === selectedChainId) as Chain;
      const selectedTokenAddress = projectData?.selectedToken?.address as string;

      const conversionLogsRef = collection(db, `referrals/${referralId}/conversionLogs`);
      const q = query(conversionLogsRef, where("isPaid", "==", false));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData & { timestamp: Timestamp };
        let amountToPay = data.amount;
        if (data.userWalletAddress) {
          amountToPay *= 2; // Double the amount if referral feature is enabled
        }
        unpaidConversionLogs.push({
          logId: doc.id,
          timestamp: data.timestamp.toDate(),
          amount: amountToPay,
          userWalletAddress: data.userWalletAddress || null,
          referralId,
          affiliateWallet,
          projectId,
          selectedChain,
          selectedTokenAddress,
          conversionId: data.conversionId,
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
