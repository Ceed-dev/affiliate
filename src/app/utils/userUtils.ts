// Firebase Imports
import { db } from "./firebase/firebaseConfig";
import { 
  doc, getDoc, getDocs, setDoc, updateDoc, collection,
  query, where, Timestamp
} from "firebase/firestore";

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
 * Checks if a given wallet address belongs to a project owner.
 * 
 * This function queries the `projects` collection to determine whether the 
 * provided wallet address is listed as an owner in any project document.
 * 
 * @param {string} walletAddress - The wallet address to check ownership for.
 * @returns {Promise<boolean>} - Resolves to true if the wallet address is associated with a project owner, false otherwise.
 */
export const isUserProjectOwner = async (walletAddress: string): Promise<boolean> => {
  try {
    const projectsCollectionRef = collection(db, "projects");
    
    // Query the 'projects' collection for documents where 'ownerAddresses' contains the wallet address
    const q = query(projectsCollectionRef, where("ownerAddresses", "array-contains", walletAddress));
    const querySnapshot = await getDocs(q);
    
    // Return true if the query result is not empty, indicating ownership
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking project ownership:", error);
    throw new Error("Failed to check project ownership");
  }
};

/**
 * Checks if a user exists in the Firestore database based on their wallet address.
 * If the user does not exist, opens the onboarding modal.
 *
 * @param walletAddress - The wallet address of the user to check in the database.
 * @param setIsModalOpen - A function to control the display of the onboarding modal.
 * @returns A Promise that resolves to true if the user exists, false if not.
 * @throws Error if there is an issue accessing the database.
 */
export async function checkUserExistenceAndShowModal(
  walletAddress: string,
  setIsModalOpen: (isOpen: boolean) => void
): Promise<boolean> {
  const userDocRef = doc(db, "users", walletAddress); // Reference to user document

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      setIsModalOpen(true); // Open the onboarding modal if user doesn't exist
      return false;
    } else {
      return true; // Return true if user exists
    }
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    console.error("Error while checking user existence: ", errorMessage);
    toast.error(`Error checking user existence: ${errorMessage}`);
    throw new Error("Failed to verify user existence");
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

/**
 * Fetches a list of unapproved users from the Firestore database.
 * This function retrieves users where the "allowed" field is set to false,
 * indicating they are pending approval.
 *
 * @returns A Promise that resolves to an array of unapproved UserData objects.
 * If there is an error during the fetch, an empty array is returned.
 */
export const fetchUnapprovedUsers = async (): Promise<UserData[]> => {
  try {
    // Reference to the users collection in Firestore
    const usersCollectionRef = collection(db, "users");

    // Query to fetch users where "allowed" is false (unapproved users)
    const unapprovedUsersQuery = query(usersCollectionRef, where("allowed", "==", false));
    const querySnapshot = await getDocs(unapprovedUsersQuery);

    // Transform the query results into UserData objects with date conversions
    const unapprovedUsers: UserData[] = querySnapshot.docs.map((doc) => {
      const userData = doc.data() as UserData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };
      return {
        ...userData,
        walletAddress: doc.id,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      } as UserData;
    });

    return unapprovedUsers;
  } catch (error) {
    console.error("Error fetching unapproved users:", error);
    return [];
  }
};

/**
 * Approves a user in the Firestore database by updating the "allowed" field to true.
 * This function is typically used for allowing access to users who have passed an approval process.
 *
 * @param walletAddress - The wallet address of the user to approve.
 * @throws Error if the update fails, providing feedback to the caller.
 */
export const approveUser = async (walletAddress: string): Promise<void> => {
  try {
    // Reference to the specific user's document in the Firestore "users" collection
    const userDocRef = doc(db, "users", walletAddress);

    // Update the "allowed" field to true, marking the user as approved
    await updateDoc(userDocRef, { allowed: true });

    console.log(`User with wallet address ${walletAddress} has been successfully approved.`);
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    console.error("Error approving user:", errorMessage);
    throw new Error("Failed to approve user");
  }
};