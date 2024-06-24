import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "../../types";

export const fetchUserData = async (walletAddress: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, "users", walletAddress);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
