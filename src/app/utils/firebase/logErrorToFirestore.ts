import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ErrorType, ErrorLog } from "../../types";

/**
 * Logs an error to the Firestore "errors" collection.
 * 
 * @param {ErrorType} errorType - The type of error (defined in ErrorType).
 * @param {string} errorMessage - A description of the error.
 * @param {Record<string, any>} [additionalData] - Optional additional data to include with the error log.
 * @returns {Promise<void>} - A promise that resolves when the log is successfully added to Firestore.
 */
export const logErrorToFirestore = async (errorType: ErrorType, errorMessage: string, additionalData?: Record<string, any>): Promise<void> => {
  const errorLog: ErrorLog = {
    errorType,
    errorMessage,
    additionalData,
    createdAt: new Date(),
  };

  try {
    // Attempt to add the error log to the Firestore "errors" collection
    await addDoc(collection(db, "errors"), errorLog);
    console.log("Error logged to Firestore successfully.");
  } catch (error) {
    // Log the error if adding the log to Firestore fails
    console.error("Failed to log error to Firestore: ", error);
  }
};
