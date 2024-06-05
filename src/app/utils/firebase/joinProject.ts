import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserData } from "../../types";
import { toast } from "react-toastify";
import { getExistingReferralId } from "./getExistingReferralId";
import { createAndReturnNewReferralId } from "./createAndReturnNewReferralId";

export async function joinProject(
  projectId: string, 
  walletAddress: string,
): Promise<string> {
  const userDocRef = doc(db, "users", walletAddress);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      toast.error("User document does not exist.");
      throw new Error("User document does not exist.");
    } else {
      const userData = userDoc.data() as UserData;
      if (userData.joinedProjectIds.includes(projectId)) {
        return await getExistingReferralId(walletAddress, projectId);
      } else {
        userData.joinedProjectIds.push(projectId);
        userData.updatedAt = new Date();
        await setDoc(userDocRef, userData);
        toast.success("You have successfully joined the project!");
        return await createAndReturnNewReferralId(walletAddress, projectId);
      }
    }
  } catch (error) {
    console.error("Failed to join project: ", error);
    toast.error("Failed to join project");
    throw new Error("Failed to join project");
  }
}