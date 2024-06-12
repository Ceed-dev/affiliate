import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function logConversion(
  referralId: string, 
  amount: number
): Promise<void> {
  const now = new Date();

  const conversionCollectionRef = collection(db, `referrals/${referralId}/conversions`);

  try {
    await addDoc(conversionCollectionRef, {
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
