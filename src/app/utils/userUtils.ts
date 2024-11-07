// Firebase Imports
import { db } from "./firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Types
import { AffiliateInfo, UserData } from "../types";

// Libraries
import { toast } from "react-toastify";

/**
 * Creates a new user document in Firestore with details provided during onboarding.
 * 
 * This function saves user information based on the user's role, managing access permissions
 * and optional data based on role-specific requirements.
 * 
 * @async
 * @function createNewUser
 * @param {string} walletAddress - The wallet address to serve as the user ID in Firestore.
 * @param {AffiliateInfo} userInfo - Information provided by the user during onboarding.
 * @returns {Promise<string>} Returns the wallet address if user creation is successful.
 */
export async function createNewUser(
  walletAddress: string,
  userInfo: AffiliateInfo,
): Promise<string> {
  const userDocRef = doc(db, "users", walletAddress);

  // Initialize a new user object with required fields and conditional access control
  const newUser: UserData = {
    username: userInfo.username,
    email: userInfo.email,
    role: userInfo.role,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Allow or deny access based on user role
    allowed: userInfo.role === "ProjectOwner" ? false : true,
  };

  // Conditionally add additional fields based on user role and available data
  if (userInfo.role === "ProjectOwner" && userInfo.projectUrl) {
    newUser.projectUrl = userInfo.projectUrl;
  }
  
  if (userInfo.role === "Affiliate") {
    newUser.joinedProjectIds = [];
  }

  // Optionally add X and Google Auth token data if provided
  if (userInfo.xAuthToken) {
    newUser.xAuthToken = userInfo.xAuthToken;
  }

  if (userInfo.xAccountInfo) {
    newUser.xAccountInfo = userInfo.xAccountInfo;
  }

  if (userInfo.googleAuthToken) {
    newUser.googleAuthToken = userInfo.googleAuthToken;
  }

  if (userInfo.youtubeAccountInfo) {
    newUser.youtubeAccountInfo = userInfo.youtubeAccountInfo;
  }

  try {
    // Save the user data to Firestore
    await setDoc(userDocRef, newUser);
    toast.success("Your account has been created successfully!");
    return walletAddress;
  } catch (error) {
    console.error("Failed to create new user and join project:", error);
    toast.error("Failed to create new user and join project.");
    throw new Error("Failed to create new user and join project");
  }
}

/**
 * Fetches a user's data from the Firestore database by user ID.
 * 
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<UserData | null>} - A promise resolving to the user data if found, or null if the user does not exist.
 * 
 * This function attempts to retrieve a specific user's data from the "users" collection
 * in Firestore using the provided user ID. If the user document exists, it returns the data 
 * as a UserData type; otherwise, it returns null.
 */
export async function fetchUserById(userId: string): Promise<UserData | null> {
  const userDocRef = doc(db, "users", userId); // Reference to the user document in Firestore
  const userDocSnapshot = await getDoc(userDocRef); // Retrieve the document snapshot

  if (userDocSnapshot.exists()) {
    // Document exists, return its data as UserData
    return userDocSnapshot.data() as UserData;
  } else {
    // Document does not exist, return null
    return null;
  }
}