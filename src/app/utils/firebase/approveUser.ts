import { db } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export const approveUser = async (walletAddress: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", walletAddress);
    await updateDoc(userDocRef, { allowed: true });
    console.log(`User with wallet address ${walletAddress} has been approved.`);
  } catch (error) {
    console.error("Error approving user:", error);
    throw new Error("Failed to approve user");
  }
};
