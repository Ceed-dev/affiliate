import { db } from "./firebaseConfig";
import { doc, collection, addDoc, getDoc } from "firebase/firestore";
import { ClickData } from "../../types";

/**
 * Logs click data to the Firestore "clicks" subcollection under the given referral document.
 * 
 * @param {string} referralId - The ID of the referral document.
 * @param {ClickData} clickData - The click data to log.
 * @returns {Promise<void>} - A promise that resolves when the click data is successfully logged.
 * @throws {Error} - Throws an error if the referral document does not exist or if logging fails.
 */
export async function logClickData(referralId: string, clickData: ClickData): Promise<void> {
  const referralDocRef = doc(db, "referrals", referralId);

  try {
    // Fetch the referral document by ID
    const referralDoc = await getDoc(referralDocRef);
    
    // Check if the referral document exists
    if (!referralDoc.exists()) {
      throw new Error(`Referral document with ID ${referralId} does not exist.`);
    }

    // Get a reference to the "clicks" subcollection and log the click data
    const clicksCollectionRef = collection(referralDocRef, "clicks");
    await addDoc(clicksCollectionRef, clickData);

    console.log("Click data logged successfully!");
  } catch (error) {
    // Log and rethrow the error for further handling
    console.error(`Failed to log click data for referral ID ${referralId}:`, error);
    throw error;
  }
}
