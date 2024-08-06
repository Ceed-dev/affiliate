import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ConversionLog } from "../../types";

export async function logConversion(
  referralId: string, 
  amount: number,
  userWalletAddress?: string,
): Promise<void> {
  const now = new Date();

  const conversionLogsCollectionRef = collection(db, `referrals/${referralId}/conversionLogs`);

  const conversionLog: ConversionLog = {
    timestamp: now,
    amount: amount,
    isPaid: false,
    userWalletAddress,
  };

  try {
    await addDoc(conversionLogsCollectionRef, conversionLog);
    console.log("Conversion successfully logged!");
  } catch (error) {
    console.error("Failed to log conversion: ", error);
    throw error;
  }
}
