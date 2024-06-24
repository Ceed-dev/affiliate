import { db } from "./firebaseConfig";
import { doc, collection, addDoc, getDoc } from "firebase/firestore";
import { ClickData } from "../../types";

export async function logClickData(referralId: string, clickData: ClickData): Promise<void> {
  const referralDocRef = doc(db, "referrals", referralId);

  try {
    const referralDoc = await getDoc(referralDocRef);
    if (!referralDoc.exists()) {
      throw new Error("Invalid referral ID");
    }

    const clicksCollectionRef = collection(referralDocRef, "clicks");
    await addDoc(clicksCollectionRef, clickData);
    console.log("Click data logged successfully!");
  } catch (error) {
    console.error("Failed to log click data: ", error);
    throw error;
  }
}
