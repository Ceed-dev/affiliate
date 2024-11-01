import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserRole } from "../../types";

// Define a type for role and username fields
export type UserRoleAndNameData = {
  role: UserRole;       // User's role, e.g., "ProjectOwner" or "Affiliate"
  username: string;   // User's username
};

/**
 * Fetches the role and username of a user from Firestore based on their wallet address.
 * @param walletAddress - The wallet address used to identify the user in Firestore.
 * @returns {Promise<UserRoleAndNameData | null>} An object containing `role` and `username` values.
 *          Returns null if the user document is not found or an error occurs.
 */
export const getUserRoleAndName = async (walletAddress: string): Promise<UserRoleAndNameData | null> => {
  try {
    // Reference to the user document in the "users" collection by wallet address
    const userDocRef = doc(db, "users", walletAddress);
    const userDoc = await getDoc(userDocRef);

    // Check if the user document exists in Firestore
    if (userDoc.exists()) {
      // Extract user data and return role and username
      const userData = userDoc.data();
      return {
        role: userData.role,
        username: userData.username,
      };
    } else {
      console.log("User document does not exist!");
      return null;
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
};