import { db } from "./firebase/firebaseConfig";
import { getFirestore, doc, getDoc, setDoc, collection } from "firebase/firestore";

/**
 * Validates the API key for an ASP (e.g., A8.net, ValueCommerce).
 *
 * - Fetches the stored API key for the given ASP from Firestore.
 * - Compares it with the provided API key.
 *
 * @param {string} apiKey - The API key provided in the request header.
 * @returns {Promise<boolean>} - Returns `true` if the API key is valid, otherwise `false`.
 */
export const validateAspApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Extract source (ASP identifier) from the API key format: "A8_XXXXXX"
    const source = apiKey.split("_")[0]; // Extract "A8" from "A8_XXXXXX"
    console.log("source:", source);

    if (!source) return false;

    // Fetch the expected API key from Firestore (from `aspApiKeys` collection)
    const apiKeyDoc = await getDoc(doc(db, "aspApiKeys", source));

    if (!apiKeyDoc.exists()) return false;

    // Compare stored API key with the provided one
    const storedApiKey = apiKeyDoc.data()?.key;
    return storedApiKey === apiKey;
  } catch (error) {
    console.error("Error validating ASP API key:", error);
    return false;
  }
};

/**
 * Saves conversion data from an external ASP (e.g., A8.net) to Firestore.
 * 
 * - Stores the conversion data inside the `aspConversions/{campaign_id}/conversions` subcollection.
 * - Uses `conversion_id` as the document ID to prevent duplicates.
 * - Adds `created_at` timestamp for tracking.
 * 
 * @param {object} conversionData - The conversion data received from the ASP.
 * @returns {Promise<string | null>} - Returns the `conversion_id` if saved successfully, otherwise `null`.
 */
export const saveAspConversionData = async (conversionData: {
  conversion_id: string;
  click_id: string;
  source: string;
  event_name: string;
  event_value: number;
  currency: string;
  campaign_id: string;
  affiliate_id: string;
  timestamp: string;
}): Promise<string | null> => {
  try {
    const db = getFirestore();

    // Prepare the data to store
    const dataToStore = {
      ...conversionData,
      created_at: new Date().toISOString(), // Add creation timestamp
    };

    // Save the conversion data to Firestore under the correct campaign_id
    await setDoc(
      doc(collection(db, "aspConversions", conversionData.campaign_id, "conversions"), conversionData.conversion_id),
      dataToStore
    );

    return conversionData.conversion_id;
  } catch (error) {
    console.error("Error saving ASP conversion data:", error);
    return null;
  }
};