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
    role: userInfo.role,
    createdAt: new Date(),
    updatedAt: new Date(),
    // =========================
    // Temporarily disabled the user access control feature.
    // This change allows all users to access the system without manual approval.
    // allowed: false,
    allowed: true,
    // =========================
  };

  // Add joinedProjectIds only if the role is Affiliate
  if (userInfo.role === "Affiliate") {
    newUser.joinedProjectIds = [];
  }

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