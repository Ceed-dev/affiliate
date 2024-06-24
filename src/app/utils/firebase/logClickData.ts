import { db } from "./firebaseConfig";
import { doc, collection, addDoc } from "firebase/firestore";
import { ClickData } from "../../types";

export async function logClickData(referralId: string, clickData: ClickData): Promise<void> {
  const referralDocRef = doc(db, "referrals", referralId);
  const clicksCollectionRef = collection(referralDocRef, "clicks");

  try {
    // クリックデータをサブコレクションに追加
    await addDoc(clicksCollectionRef, clickData);
    console.log("Click data logged successfully!");
  } catch (error) {
    console.error("Failed to log click data: ", error);
    throw error;
  }
}
