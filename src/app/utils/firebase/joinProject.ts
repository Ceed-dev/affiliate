import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserData } from "../../types";
import { toast } from "react-toastify";
import { getExistingReferralId } from "./getExistingReferralId";
import { createAndReturnNewReferralId } from "./createAndReturnNewReferralId";

export async function joinProject(
  projectId: string, 
  walletAddress: string,
  allConversionPointsInactive: boolean,
): Promise<string> {
  const userDocRef = doc(db, "users", walletAddress);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      toast.error("User document does not exist.");
      throw new Error("User document does not exist.");
    } else {
      const userData = userDoc.data() as UserData;

      // Check if the user's role is Affiliate
      if (userData.role !== "Affiliate") {
        toast.error("Only affiliates can join projects.");
        throw new Error("Only affiliates can join projects.");
      }

      // Initialize joinedProjectIds if it is undefined
      if (!userData.joinedProjectIds) {
        userData.joinedProjectIds = [];
      }

      // If you are already part of the project, return the referral ID.
      if (userData.joinedProjectIds.includes(projectId)) {
        return await getExistingReferralId(walletAddress, projectId);
      }

      // Restrict participation for new participants if all conversion points are inactive
      if (allConversionPointsInactive) {
        toast.error("All conversion points are currently inactive. You cannot join this project.");
        return "";
      }

      // If you are a new participant and can join the project
      userData.joinedProjectIds.push(projectId);
      userData.updatedAt = new Date();
      await setDoc(userDocRef, userData);
      toast.success("You have successfully joined the project!");
      return await createAndReturnNewReferralId(walletAddress, projectId);
    }
  } catch (error) {
    console.error("Failed to join project: ", error);
    toast.error("Failed to join project");
    throw new Error("Failed to join project");
  }
}