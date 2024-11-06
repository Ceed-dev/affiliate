import { db } from "./firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "../types";

/**
 * Fetches a user's data from the Firestore database by user ID.
 * 
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<UserData | null>} - A promise resolving to the user data if found, or null if the user does not exist.
 * 
 * This function attempts to retrieve a specific user's data from the "users" collection
 * in Firestore using the provided user ID. If the user document exists, it returns the data 
 * as a UserData type; otherwise, it returns null.
 */
export async function fetchUserById(userId: string): Promise<UserData | null> {
  const userDocRef = doc(db, "users", userId); // Reference to the user document in Firestore
  const userDocSnapshot = await getDoc(userDocRef); // Retrieve the document snapshot

  if (userDocSnapshot.exists()) {
    // Document exists, return its data as UserData
    return userDocSnapshot.data() as UserData;
  } else {
    // Document does not exist, return null
    return null;
  }
}