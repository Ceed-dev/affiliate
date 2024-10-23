import { collection, query, where, getDocs, getDoc, DocumentData, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { XAuthToken, XAccountInfo, GoogleAuthToken, YouTubeAccountInfo, TweetData, TweetEngagementUpdate } from "../../types/affiliateInfo";
import { LogType } from "../../types/log";
import { fetchTweetEngagementForPastTweets, fetchTweetEngagementForRecentTweets } from "../xApiUtils";

type XData = {
  platform: "X";
  walletAddress: string;
  joinedProjectIds: string[];
  xAuthToken: XAuthToken;
  xAccountInfo: XAccountInfo;
};

type YouTubeData = {
  platform: "YouTube";
  walletAddress: string;
  joinedProjectIds: string[];
  googleAuthToken: GoogleAuthToken;
  youtubeAccountInfo: YouTubeAccountInfo;
};

type PlatformData = XData | YouTubeData;

/**
 * Fetches the affiliate users with project data and platform account information necessary for retrieving engagement data.
 * Filters the users based on their role as "Affiliate" and ensures they have joined projects and valid platform authentication tokens.
 * @param addLog - A function to add log entries for tracking the process (used only for error logging).
 * @param platform - The platform for which engagement data is being retrieved ("X" or "YouTube").
 * @returns {Promise<PlatformData[]>} An array of affiliate user data necessary for engagement processing.
 */
const getInfoForEngagementData = async (
  addLog: (log: string, type: LogType, indentLevel?: number) => void,
  platform: "X" | "YouTube"
): Promise<PlatformData[]> => {
  const usersCollectionRef = collection(db, "users"); // Reference to the users collection

  try {
    // Firestore query to filter users based on role and joinedProjectIds
    const q = query(
      usersCollectionRef,
      where("role", "==", "Affiliate"), // Filter by affiliate role
      where("joinedProjectIds", "!=", null) // Ensure the user has joined projects
    );

    const querySnapshot = await getDocs(q); // Execute the Firestore query

    // Map the query results to extract necessary data for platform authentication and account info
    const filteredUsers = querySnapshot.docs
      .map(doc => {
        const data = doc.data() as DocumentData;

        // Platform-specific authentication and account info
        if (platform === "X" && data.xAuthToken && data.xAccountInfo) {
          return {
            platform: "X",  // Distinguish X platform
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
        } else if (platform === "YouTube" && data.googleAuthToken && data.youtubeAccountInfo) {
          return {
            platform: "YouTube",  // Distinguish YouTube platform
            walletAddress: doc.id, // Use the document ID as the wallet address
            joinedProjectIds: data.joinedProjectIds, // Joined project IDs

            // Provide all required GoogleAuthToken data
            googleAuthToken: {
              token_type: data.googleAuthToken.token_type, // Token type
              access_token: data.googleAuthToken.access_token, // Access token
              scope: data.googleAuthToken.scope, // Token scope
              refresh_token: data.googleAuthToken.refresh_token, // Refresh token
              expiry_date: data.googleAuthToken.expiry_date, // Token expiration time
            } as GoogleAuthToken,

            // Provide only the required YouTubeAccountInfo (id)
            youtubeAccountInfo: {
              id: data.youtubeAccountInfo.id, // User's YouTube account id
            } as YouTubeAccountInfo,
          };
        } else {
          return null; // Skip if the required platform info is not available
        }
      })
      .filter((user): user is PlatformData => user !== null); // Remove any null results

    return filteredUsers;
  } catch (error: any) {
    addLog(`Error fetching affiliates with projects and ${platform} account info: ${error.message}`, "error");
    console.error(`Error fetching affiliates with projects and ${platform} account info:`, error);
    throw new Error(`Failed to fetch affiliates with projects and ${platform} account info`);
  }
};

type XReferralData = {
  referralId: string;
  tweetNewestId?: string;
  tweetNewestCreatedAt?: Date;
  pastTweetIds?: string[];
};

type YouTubeReferralData = {
  referralId: string;
};

/**
 * Fetches referral data based on the user's wallet address and project ID, and platform type.
 * For X, retrieves the referral ID, newest tweet ID, tweet creation date, and past tweet IDs from the referral's tweets subcollection.
 * For YouTube, retrieves only the referral ID.
 * 
 * @param {string} walletAddress - The wallet address of the affiliate user.
 * @param {string} projectId - The ID of the associated project.
 * @param {string} platform - The platform type ("X" or "YouTube").
 * @param addLog - A function to add log entries for tracking the process.
 * @returns {Promise<XReferralData | YouTubeReferralData>} - Referral data including platform-specific information.
 */
const fetchReferralByWalletAndProject = async (
  walletAddress: string,
  projectId: string,
  platform: "X" | "YouTube",
  addLog: (log: string, type: LogType, indentLevel?: number) => void
): Promise<XReferralData | YouTubeReferralData> => {
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

    if (platform === "X") {
      // For X platform, extract newest tweet ID, creation date, and past tweet IDs
      const tweetNewestId = referralData.tweetNewestId ?? undefined;
      const tweetNewestCreatedAt = referralData.tweetNewestCreatedAt ? referralData.tweetNewestCreatedAt.toDate() : undefined;

      // Fetch past tweet IDs from the tweets subcollection
      const tweetsCollectionRef = collection(db, `referrals/${referralDoc.id}/tweets`);
      const tweetSnapshot = await getDocs(tweetsCollectionRef);
      const pastTweetIds = tweetSnapshot.docs.map((tweetDoc) => tweetDoc.id); // Map tweet IDs from document IDs

      addLog(`Found ${pastTweetIds.length} past tweets for referral ID: ${referralDoc.id}`, "log", 2);

      return {
        referralId: referralDoc.id,
        tweetNewestId,
        tweetNewestCreatedAt,
        pastTweetIds
      };
    } else if (platform === "YouTube") {
      // For YouTube platform, return only the referral ID
      return {
        referralId: referralDoc.id
      };
    } else {
      throw new Error("Invalid platform type provided");
    }
  } catch (error: any) {
    addLog(`Error fetching referral data for wallet: ${walletAddress} and project: ${projectId}, Message: ${error.message}`, "error", 2);
    console.error("Error fetching referral data:", error);
    throw new Error("Failed to fetch referral data");
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

/**
 * Fetches and updates engagement data for all affiliates with joined projects on the specified platform (X or YouTube).
 * Manages loading state, logs the current operation, and updates the progress bar in real-time.
 *
 * @param { "X" | "YouTube" } platform - The platform for which engagement data is being retrieved and updated (either "X" or "YouTube").
 * @param {function} setProcessing - A function to update the processing state (true/false) to indicate if the process is currently running.
 * @param {function} addLog - A function to add a new log entry for tracking the process. Takes the log message, log type ("log", "warning", "error"), and an optional indentation level.
 * @param {function} setTotalTasks - A function to set the total number of tasks, primarily used for the progress bar to indicate how many tasks need to be completed.
 * @param {function} setCompletedTasks - A function to update the number of completed tasks, used to track progress for each user/project pair processed.
 *
 * @returns {Promise<void>} - A promise that resolves when all engagement data has been fetched and updated for the specified platform.
 */
export const fetchAndUpdateEngagementData = async (
  platform: "X" | "YouTube",
  setProcessing: (isProcessing: boolean) => void,
  addLog: (log: string, logType: LogType, indentLevel?: number) => void,
  setTotalTasks: (totalTasks: number) => void,
  setCompletedTasks: (completedTasks: number) => void
): Promise<void> => {
  try {
    setProcessing(true);
    addLog(`Fetching affiliate data for platform: ${platform}`, "log");

    // Step 1: Get affiliate user information
    const users = await getInfoForEngagementData(addLog, platform);
    addLog(`Found ${users.length} affiliates with joined projects for platform: ${platform}.`, "log");

    // Step 2: Calculate and set the total number of tasks
    const totalTasks = users.reduce((acc, user) => acc + user.joinedProjectIds!.length, 0);
    setTotalTasks(totalTasks); // Set total tasks for progress bar

    let completedTasks = 0;

    // Step 3: Loop through each user's wallet address and project IDs to fetch referral data
    for (const user of users) {
      const { walletAddress, joinedProjectIds } = user;

      for (const projectId of joinedProjectIds!) {
        addLog(`Processing wallet: ${walletAddress}, project: ${projectId} for platform: ${platform}`, "log", 1);

        const referral = await fetchReferralByWalletAndProject(walletAddress, projectId, platform, addLog);

        if (platform === "X" && referral) {
          const { xAuthToken, xAccountInfo } = user as XData;
          const xReferral = referral as XReferralData;
          let result = {
            ...xReferral,
            pastTweetEngagementData: undefined as any[] | undefined,
            recentTweetEngagementData: undefined as any[] | undefined,
          };

          // Step 4: Fetch past tweet engagement data
          if (xReferral.pastTweetIds && xReferral.pastTweetIds.length > 0) {
            addLog(`Fetching past tweet engagement data for ${xReferral.pastTweetIds.length} tweets.`, "log", 2);
            const pastTweetEngagementData = await fetchTweetEngagementForPastTweets(xReferral.pastTweetIds, addLog);
            result.pastTweetEngagementData = pastTweetEngagementData;
          } else {
            addLog(`No past tweets found for referral ID: ${xReferral.referralId}.`, "warning", 2);
          }

          // Step 5: Always search for recent tweet engagement data
          let tweetNewestId = undefined;

          if (xReferral.tweetNewestCreatedAt) {
            addLog("Found tweetNewestCreatedAt. Checking if it's within the last week.", "log", 2);

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            if (xReferral.tweetNewestCreatedAt >= oneWeekAgo) {
              tweetNewestId = xReferral.tweetNewestId;
              addLog(`tweetNewestId is within the last week. Using tweetNewestId: ${tweetNewestId}`, "log", 2);
            } else {
              addLog("tweetNewestId is older than one week. Not using it for recent search.", "warning", 2);
            }
          } else {
            addLog("No tweetNewestCreatedAt found. Proceeding without tweetNewestId.", "warning", 2);
          }

          addLog(`Fetching recent tweet engagement data for user: ${xAccountInfo?.username}`, "log", 2);
          const recentTweetEngagementData = await fetchTweetEngagementForRecentTweets(
            xAccountInfo?.username as string,
            xReferral.referralId as string,
            xAuthToken?.access_token as string,
            addLog,
            tweetNewestId
          );
          result.recentTweetEngagementData = recentTweetEngagementData;

          // Step 6: Update the tweet engagement data in Firestore
          const tweetEngagementUpdate: TweetEngagementUpdate = {
            username: xAccountInfo?.username as string,
            referralId: xReferral.referralId as string,
            pastTweetEngagementData: result.pastTweetEngagementData,
            recentTweetEngagementData: result.recentTweetEngagementData,
          };
          addLog(`Updating tweet engagement data in Firestore for referral: ${xReferral.referralId}`, "log", 2);
          await updateTweetEngagementData(tweetEngagementUpdate, addLog);

        } else if (platform === "YouTube" && referral) {
          const { googleAuthToken, youtubeAccountInfo } = user as YouTubeData;
          
          addLog(`YouTube platform detected. Fetching engagement data for channel: ${youtubeAccountInfo.id}`, "log", 2);
          
          // TODO: YouTubeのエンゲージメントデータ取得処理をここに実装
        }

        // Step 7: Update the completed tasks count and progress
        completedTasks += 1;
        setCompletedTasks(completedTasks); // Update completed tasks for progress bar
      }
    }

    addLog(`All affiliate data processed successfully for platform: ${platform}`, "log");
  } catch (error: any) {
    addLog(`Error fetching and updating engagement data for platform: ${platform}. Message: ${error.message}`, "error");
    console.error(`Error fetching and updating engagement data for platform: ${platform}`, error);
  } finally {
    setProcessing(false);
  }
};