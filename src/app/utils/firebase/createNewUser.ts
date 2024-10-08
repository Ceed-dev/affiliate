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

  // Add projectUrl only if the role is ProjectOwner
  if (userInfo.role === "ProjectOwner" && userInfo.projectUrl) {
    newUser.projectUrl = userInfo.projectUrl;
  }

  // Add joinedProjectIds only if the role is Affiliate
  if (userInfo.role === "Affiliate") {
    newUser.joinedProjectIds = [];
  }

  // Add X Auth Token and X Account Info if they exist
  if (userInfo.xAuthToken) {
    newUser.xAuthToken = userInfo.xAuthToken; // Save the X auth token data
  }

  if (userInfo.xAccountInfo) {
    newUser.xAccountInfo = userInfo.xAccountInfo; // Save the X account information
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