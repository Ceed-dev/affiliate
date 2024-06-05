import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export async function checkUserAndPrompt(
  walletAddress: string,
  setIsModalOpen: (isOpen: boolean) => void
): Promise<boolean> {
  const userDocRef = doc(db, "users", walletAddress);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      setIsModalOpen(true);
      return false;
    } else {
      return true;
    }
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    console.error("Error checking user existence: ", errorMessage);
    toast.error(`Error checking user existence: ${errorMessage}`);
    throw new Error("Failed to check user existence");
  }
}
