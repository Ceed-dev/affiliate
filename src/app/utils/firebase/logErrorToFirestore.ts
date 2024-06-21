import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ErrorType, ErrorLog } from "../../types";

export const logErrorToFirestore = async (errorType: ErrorType, errorMessage: string, additionalData?: Record<string, any>) => {
  try {
    const errorLog: ErrorLog = {
      errorType,
      errorMessage,
      additionalData,
      createdAt: new Date(),
    };
    await addDoc(collection(db, "errors"), errorLog);
    console.log("Error logged to Firestore successfully.");
  } catch (error) {
    console.error("Failed to log error to Firestore: ", error);
  }
};
