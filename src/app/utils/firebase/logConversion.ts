import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function logConversion(
  referralId: string, 
  amount: number
): Promise<void> {
  const now = new Date();

  const conversionLogsCollectionRef = collection(db, `referrals/${referralId}/conversionLogs`);

  try {
    await addDoc(conversionLogsCollectionRef, {
      timestamp: now,
      amount: amount,
      isPaid: false
    });
    console.log("Conversion successfully logged!");
  } catch (error) {
    console.error("Failed to log conversion: ", error);
    throw error;
  }
}
