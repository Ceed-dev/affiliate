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

/**
 * Fetches the latest tweet engagement data for the given array of past tweet IDs by calling the Qube product's tweet lookup API.
 * 
 * @param {string[]} pastTweetIds - Array of tweet IDs to fetch engagement data for.
 * @param addLog - A function to log messages during the fetching process.
 * @returns {Promise<any[]>} - A promise that resolves to an array of engagement data for each tweet.
 */
const fetchTweetEngagementForPastTweets = async (
  pastTweetIds: string[],
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<any[]> => {
  try {
    // Construct the full URL for the tweet lookup API
    const apiUrl = API_ENDPOINTS.TWEET_LOOKUP(pastTweetIds);

    addLog(`Calling API: ${apiUrl}`, "log", 3);

    // Send a GET request to the Qube API's tweet lookup endpoint, passing the tweet IDs
    const response = await fetch(apiUrl, {
      method: "GET",  // Using GET method to retrieve data
      headers: {
        "internal-api-key": INTERNAL_API_KEY,  // Send internal API key
      }
    });

    // Check if the API request was successful
    if (!response.ok) {
      addLog(`Failed to fetch tweet engagement data: ${response.statusText}`, "error", 3);
      throw new Error(`Failed to fetch tweet engagement data: ${response.statusText}`);
    }

    // Parse and return the response as JSON, which contains the tweet engagement data
    const tweetEngagementData = await response.json();
    addLog(`Successfully fetched engagement data for ${pastTweetIds.length} past tweets.`, "log", 3);

    return tweetEngagementData;
  } catch (error: any) {
    addLog(`Error fetching tweet engagement data for past tweets. Message: ${error.message}`, "error", 3);
    console.error("Error fetching tweet engagement data for past tweets:", error);
    throw new Error("Failed to fetch tweet engagement data for past tweets");
  }
};

/**
 * Fetches recent tweet engagement data for a given username and referral ID.
 * Calls the Qube API's recent tweet search endpoint.
 *
 * @param username - The username of the X account to search for tweets.
 * @param referralId - The referral ID associated with the tweets.
 * @param xAuthToken - The user's X API authentication token.
 * @param addLog - A function to add log entries for tracking the process.
 * @param tweetNewestId - (Optional) The newest tweet ID to filter tweets from a specific point in time.
 * @returns {Promise<any[]>} - An array of engagement data for the fetched tweets.
 */
const fetchTweetEngagementForRecentTweets = async (
  username: string, 
  referralId: string, 
  xAuthToken: string, 
  addLog: (log: string, type: LogType, indentLevel?: number) => void,
  tweetNewestId?: string,
): Promise<any[]> => {
  try {
    // Construct the full URL for the recent tweet search API
    const apiUrl = API_ENDPOINTS.TWEET_RECENT_SEARCH(username, referralId, tweetNewestId);

    addLog(`Calling API: ${apiUrl}`, "log", 3);

    // Call the Qube API to fetch the tweet engagement data
    const response = await fetch(apiUrl, {
      method: "GET", // Using GET method to retrieve data
      headers: {
        "internal-api-key": INTERNAL_API_KEY,  // Send internal API key
      },
    });

    // Check if the API request was successful
    if (!response.ok) {
      addLog(`Failed to fetch tweet engagement data: ${response.statusText}`, "error", 3);
      throw new Error(`Failed to fetch recent tweet engagement data: ${response.statusText}`);
    }

    addLog("Successfully fetched recent tweet engagement data.", "log", 3);

    // Return the tweet engagement data as JSON
    const tweetEngagementData = await response.json();
    return tweetEngagementData;
  } catch (error: any) {
    addLog(`Error fetching tweet engagement data for username: ${username} and referralId: ${referralId}, Message: ${error.message}`, "error", 3);
    console.error(`Error fetching recent tweet engagement data for username: ${username} and referralId: ${referralId}`, error);
    throw new Error(`Failed to fetch recent tweet engagement data for username: ${username} and referralId: ${referralId}`);
  }
};

/**
 * Updates or creates tweet engagement data in Firestore based on the provided engagement data.
 * 
 * @param tweetEngagementData - The engagement data for past and recent tweets.
 * @param addLog - A function to add log entries for tracking the process.
 */
const updateTweetEngagementData = async (
  tweetEngagementData: TweetEngagementUpdate,
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<void> => {
  const { username, referralId, pastTweetEngagementData, recentTweetEngagementData } = tweetEngagementData;

  if (!referralId) {
    const errorMessage = "Referral ID is missing.";
    addLog(errorMessage, "error", 3);
    console.error(errorMessage);
    throw new Error("Referral ID is required to update tweet engagement data.");
  }

  try {
    addLog(`Starting update for referralId: ${referralId}`, "log", 3);

    // Reference to the tweets subcollection within the referral document in Firestore
    const tweetsCollectionRef = collection(db, `referrals/${referralId}/tweets`);

    // Step 1: Update past tweets engagement data if available
    if (pastTweetEngagementData?.length) {
      addLog(`Updating past tweet engagement data for ${pastTweetEngagementData.length} tweets.`, "log", 3);

      await Promise.all(
        pastTweetEngagementData.map(async (tweet) => {
          const tweetDocRef = doc(tweetsCollectionRef, tweet.id);

          const tweetDocSnap = await getDoc(tweetDocRef);
          if (tweetDocSnap.exists()) {
            const existingTweetData = tweetDocSnap.data() as TweetData;

            // Update engagement metrics and the fetch count
            await updateDoc(tweetDocRef, {
              metrics: {
                retweetCount: tweet.public_metrics.retweet_count,
                replyCount: tweet.public_metrics.reply_count,
                likeCount: tweet.public_metrics.like_count,
                quoteCount: tweet.public_metrics.quote_count,
                bookmarkCount: tweet.public_metrics.bookmark_count,
                impressionCount: tweet.public_metrics.impression_count,
              },
              lastFetchedAt: new Date(), // Update the last fetched timestamp
              fetchCount: existingTweetData.fetchCount + 1, // Increment the fetch count
            });

            addLog(`Updated engagement data for past tweet ID: ${tweet.id}`, "log", 3);
          }
        })
      );
    } else {
      addLog("No past tweet engagement data to update.", "warning", 3);
    }

    // Step 2: Add new tweets engagement data if available
    if (recentTweetEngagementData?.length) {
      addLog(`Adding new tweet engagement data for ${recentTweetEngagementData.length} tweets.`, "log", 3);

      let newestTweetId: string | null = null;
      let newestTweetCreatedAt: Date | null = null;

      await Promise.all(
        recentTweetEngagementData.map(async (tweet) => {
          const tweetDocRef = doc(tweetsCollectionRef, tweet.id);

          // Create a new document for each new tweet
          await setDoc(tweetDocRef, {
            tweetText: tweet.text,
            tweetUrl: `https://x.com/${username}/status/${tweet.id}`,
            metrics: {
              retweetCount: tweet.public_metrics.retweet_count,
              replyCount: tweet.public_metrics.reply_count,
              likeCount: tweet.public_metrics.like_count,
              quoteCount: tweet.public_metrics.quote_count,
              bookmarkCount: tweet.public_metrics.bookmark_count,
              impressionCount: tweet.public_metrics.impression_count,
            },
            createdAt: new Date(tweet.created_at), // Record the tweet creation date
            firstFetchedAt: new Date(), // Record when the engagement data was first fetched
            lastFetchedAt: new Date(), // Record when the engagement data was last fetched
            fetchCount: 1, // Initial fetch count is 1
          });

          addLog(`Added new tweet engagement data for tweet ID: ${tweet.id}`, "log", 3);

          // Identify the newest tweet based on creation date
          const tweetCreatedAt = new Date(tweet.created_at);
          if (!newestTweetCreatedAt || tweetCreatedAt > newestTweetCreatedAt) {
            newestTweetCreatedAt = tweetCreatedAt;
            newestTweetId = tweet.id;
          }
        })
      );

      // Step 3: Update referral document with the newest tweet's ID and creation date
      if (newestTweetId && newestTweetCreatedAt) {
        const referralDocRef = doc(db, `referrals/${referralId}`);

        await updateDoc(referralDocRef, {
          tweetNewestId: newestTweetId,
          tweetNewestCreatedAt: newestTweetCreatedAt,
        });

        addLog(`Updated referral document with newest tweet ID: ${newestTweetId}`, "log", 3);
      }
    } else {
      addLog("No recent tweet engagement data to add.", "warning", 3);
    }
  } catch (error: any) {
    addLog(`Error updating tweet engagement data for referralId: ${referralId}, Message: ${error.message}`, "error", 3);
    console.error("Error updating tweet engagement data:", error);
    throw new Error(`Failed to update tweet engagement data for referralId: ${referralId}`);
  }
};