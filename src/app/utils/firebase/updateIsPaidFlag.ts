import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const updateIsPaidFlag = async (referralId: string, logId: string, isPaid: boolean) => {
  try {
    const conversionLogRef = doc(db, `referrals/${referralId}/conversionLogs/${logId}`);
    await updateDoc(conversionLogRef, { isPaid });
    console.log(`isPaid flag updated to ${isPaid} for logId: ${logId}`);
  } catch (error: any) {
    console.error(`Failed to update isPaid flag for logId: ${logId}`, error);
    throw new Error(`Failed to update isPaid flag: ${error.message}`);
  }
};
