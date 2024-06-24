import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { AffiliateInfo, UserData } from "../../types";
import { toast } from "react-toastify";

export async function createNewUser(
  walletAddress: string,
  userInfo: AffiliateInfo,
): Promise<string> {
  const userDocRef = doc(db, "users", walletAddress);
  const newUser: UserData = {
    username: userInfo.username,
    email: userInfo.email,
    xProfileUrl: userInfo.xProfileUrl,
    joinedProjectIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    allowed: false,
  };

  try {
    await setDoc(userDocRef, newUser);
    toast.success("Your account has been created successfully!");
    return walletAddress;
  } catch (error) {
    console.error("Failed to create new user and join project: ", error);
    toast.error("Failed to create new user and join project.");
    throw new Error("Failed to create new user and join project");
  }
}