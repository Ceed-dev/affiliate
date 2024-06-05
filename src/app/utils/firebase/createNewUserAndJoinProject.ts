import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { AffiliateInfo, UserData } from "../../types";
import { toast } from "react-toastify";
import { createAndReturnNewReferralId } from "./createAndReturnNewReferralId";

export async function createNewUserAndJoinProject(
  projectId: string,
  walletAddress: string,
  userInfo: AffiliateInfo,
): Promise<string> {
  const userDocRef = doc(db, "users", walletAddress);
  const newUser: UserData = {
    username: userInfo.username,
    email: userInfo.email,
    xProfileUrl: userInfo.xProfileUrl,
    joinedProjectIds: [projectId],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await setDoc(userDocRef, newUser);
    toast.success("Your account has been created successfully!");
    return await createAndReturnNewReferralId(walletAddress, projectId);
  } catch (error) {
    console.error("Failed to create new user and join project: ", error);
    toast.error("Failed to create new user and join project.");
    throw new Error("Failed to create new user and join project");
  }
}