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

/**
 * Fetches referral data based on the user's wallet address and project ID.
 * Retrieves the referral ID, newest tweet ID, tweet creation date, and past tweet IDs from the referral's tweets subcollection.
 * @param {string} walletAddress - The wallet address of the affiliate user.
 * @param {string} projectId - The ID of the associated project.
 * @param addLog - A function to add log entries for tracking the process.
 * @returns {Promise<{referralId: string, tweetNewestId?: string, tweetNewestCreatedAt?: Date, pastTweetIds?: string[]}>} - Referral data including tweet information.
 *    Returns referralId, tweetNewestId, tweetNewestCreatedAt, and an array of past tweet IDs if available.
 */
const fetchReferralByWalletAndProject = async (
  walletAddress: string,
  projectId: string,
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<{ referralId: string, tweetNewestId?: string, tweetNewestCreatedAt?: Date, pastTweetIds?: string[] }> => {
  const referralsCollectionRef = collection(db, "referrals");

  try {
    addLog(`Fetching referral data for wallet: ${walletAddress} and project: ${projectId}`, "log", 2);

    // Query referrals collection by wallet address and project ID
    const q = query(
      referralsCollectionRef,
      where("affiliateWallet", "==", walletAddress), // Filter by wallet address
      where("projectId", "==", projectId) // Filter by project ID
    );

    const querySnapshot = await getDocs(q); // Execute Firestore query

    const referralDoc = querySnapshot.docs[0];
    const referralData = referralDoc.data();

    addLog(`Referral data found for wallet: ${walletAddress} and project: ${projectId}`, "log", 2);

    // Extract newest tweet ID and creation date, if available
    const tweetNewestId = referralData.tweetNewestId ?? undefined;
    const tweetNewestCreatedAt = referralData.tweetNewestCreatedAt ? referralData.tweetNewestCreatedAt.toDate() : undefined;

    // Fetch past tweet IDs from the tweets subcollection
    const tweetsCollectionRef = collection(db, `referrals/${referralDoc.id}/tweets`);
    const tweetSnapshot = await getDocs(tweetsCollectionRef);
    const pastTweetIds = tweetSnapshot.docs.map(tweetDoc => tweetDoc.id); // Map tweet IDs from document IDs

    addLog(`Found ${pastTweetIds.length} past tweets for referral ID: ${referralDoc.id}`, "log", 2);

    return {
      referralId: referralDoc.id,
      tweetNewestId,
      tweetNewestCreatedAt,
      pastTweetIds
    };
  } catch (error: any) {
    addLog(`Error fetching referral data for wallet: ${walletAddress} and project: ${projectId}, Message: ${error.message}`, "error", 2);
    console.error("Error fetching referral data:", error);
    throw new Error("Failed to fetch referral data");
  }
};