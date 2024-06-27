import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const checkUserRole = async (walletAddress: string): Promise<string | null> => {
  try {
    const userDocRef = doc(db, "users", walletAddress);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || null;
    } else {
      console.log("User document does not exist!");
      return null;
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
};
