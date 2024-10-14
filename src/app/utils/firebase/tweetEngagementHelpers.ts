import { collection, query, where, getDocs, getDoc, DocumentData, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { UserData } from "../../types";
import { XAuthToken, XAccountInfo, TweetData, TweetEngagementUpdate } from "../../types/affiliateInfo";
import { LogType } from "../../types/log";
import { API_ENDPOINTS } from "../../constants/xApiConstants";

// Include the internal API key from environment variables
const INTERNAL_API_KEY = process.env.NEXT_PUBLIC_INTERNAL_API_KEY as string;

/**
 * Fetches the affiliate users with project data and X account information necessary for retrieving tweet engagement data.
 * Filters the users based on their role as "Affiliate" and ensures they have joined projects and valid X authentication tokens.
 * @param addLog - A function to add log entries for tracking the process (used only for error logging).
 * @returns {Promise<Pick<UserData, "walletAddress" | "joinedProjectIds" | "xAuthToken" | "xAccountInfo">[]>} An array of affiliate user data necessary for tweet engagement processing.
 */
const getInfoForTweetEngagementData = async (
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<Pick<UserData, "walletAddress" | "joinedProjectIds" | "xAuthToken" | "xAccountInfo">[]> => {
  const usersCollectionRef = collection(db, "users"); // Reference to the users collection

  try {
    // Firestore query to filter users based on role and joinedProjectIds
    const q = query(
      usersCollectionRef,
      where("role", "==", "Affiliate"), // Filter by affiliate role
      where("joinedProjectIds", "!=", null) // Ensure the user has joined projects
    );

    const querySnapshot = await getDocs(q); // Execute the Firestore query

    // Map the query results to extract necessary data for X authentication and account info
    const filteredUsers = querySnapshot.docs
      .map(doc => {
        const data = doc.data() as DocumentData;

        // Check for valid XAuthToken and XAccountInfo
        if (data.xAuthToken && data.xAccountInfo) {
          return {
            walletAddress: doc.id, // Use the document ID as the wallet address
            joinedProjectIds: data.joinedProjectIds, // Joined project IDs

            // Provide all required XAuthToken data
            xAuthToken: {
              token_type: data.xAuthToken.token_type, // Token type
              access_token: data.xAuthToken.access_token, // Access token
              scope: data.xAuthToken.scope, // Token scope
              refresh_token: data.xAuthToken.refresh_token, // Refresh token
              expires_at: data.xAuthToken.expires_at, // Token expiration time
            } as XAuthToken,

            // Provide only the required XAccountInfo (username)
            xAccountInfo: {
              username: data.xAccountInfo.username, // User's X account username
            } as XAccountInfo,
          };
        } else {
          return null;
        }
      })
      .filter(user => user !== null); // Remove any null results

    return filteredUsers as Pick<UserData, "walletAddress" | "joinedProjectIds" | "xAuthToken" | "xAccountInfo">[];
  } catch (error: any) {
    addLog(`Error fetching affiliates with projects and X account info: ${error.message}`, "error");
    console.error("Error fetching affiliates with projects and X account info:", error);
    throw new Error("Failed to fetch affiliates with projects and X account info");
  }
};