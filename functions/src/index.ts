// ============================
// Environment and API Setup
// ============================

// Firebase Admin initialization for database interaction
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {IncomingWebhook} from "@slack/webhook";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Slack Webhook URL for sending notifications
const SLACK_WEBHOOK_URL = functions.config().slack.webhook_url;

// X API Bearer Token for accessing the X (formerly Twitter) API
const X_API_BEARER_TOKEN = functions.config().x_api.bearer_token;

// Initialize Slack Webhook
const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

// Email environment variables for nodemailer setup
const EMAIL_USER = functions.config().email.user;
const EMAIL_PASS = functions.config().email.pass;

// Nodemailer transport setup to send emails through Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Qube's official email address to be used for email notifications
const qubeMailAddress = "\"Qube\" <official@0xqube.xyz>";

// ============================
// Type Definitions
// ============================

/**
 * Defines the structure for Tweet Engagement data.
 * It includes metrics like retweets, replies, and impressions.
 */
type TweetEngagement = {
  referralId: string;
  tweetUrl: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  bookmarkCount: number;
  impressionCount: number;
  fetchedAt: Date; // Date when the data was fetched
};

// ============================
// Utility Functions
// ============================

/**
 * Sends a Slack notification with the given message.
 * @param {object} message - The message object to send to Slack.
 */
async function sendSlackNotification(message: object): Promise<void> {
  await webhook.send({
    text: JSON.stringify(message, null, 2),
  });
}

/**
 * Updates tweet engagement data in Firestore for each referral.
 * This function iterates over an array of TweetEngagement objects,
 * and updates the corresponding Firestore documents for each
 * referral with the tweet engagement metrics.
 *
 * @param {TweetEngagement[]} tweetDataArray - Array of TweetEngagement objects
 * with engagement data to be updated in Firestore.
 */
const updateTweetEngagement = async (tweetDataArray: TweetEngagement[]) => {
  try {
    const updatePromises = tweetDataArray.map(async (tweetData) => {
      const referralDocRef = db.doc(`referrals/${tweetData.referralId}`);

      await referralDocRef.update({
        tweetEngagement: {
          retweetCount: tweetData.retweetCount,
          replyCount: tweetData.replyCount,
          likeCount: tweetData.likeCount,
          quoteCount: tweetData.quoteCount,
          bookmarkCount: tweetData.bookmarkCount,
          impressionCount: tweetData.impressionCount,
          fetchedAt: tweetData.fetchedAt,
        },
      });
    });

    await Promise.all(updatePromises);
    console.log("Firestore updated successfully.");
  } catch (error) {
    console.error("Firestore update failed:", error);
  }
};

// ============================
// Firestore Triggers
// ============================

/**
 * Function triggered when a new user is created in Firestore.
 * It sends a Slack notification with the user details.
 */
export const onUserCreated = functions.firestore
  .document("users/{walletAddress}")
  .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const walletAddress = context.params.walletAddress;

    if (newUser) {
      let userType: string;
      if (newUser.role === "ProjectOwner") {
        userType = "Ad publisher";
      } else {
        userType = "Affiliater";
      }

      const message = {
        type: "user_created",
        walletAddress,
        createdAt: newUser.createdAt.toDate(),
        username: newUser.username,
        email: newUser.email,
        xProfileUrl: newUser.xProfileUrl,
        userType,
        ...(newUser.projectUrl && {projectUrl: newUser.projectUrl}),
      };

      await sendSlackNotification(message);
    }
  });

/**
 * Function triggered when a new conversion log is created in Firestore.
 * Sends a Slack notification with conversion details.
 */
export const onConversionLogCreated = functions.firestore
  .document("referrals/{referralId}/conversionLogs/{logId}")
  .onCreate(async (snap, context) => {
    const newConversionLog = snap.data();
    const referralId = context.params.referralId;

    if (newConversionLog) {
      // Fetch additional details from the database
      const referralDoc = await db.doc(`referrals/${referralId}`).get();
      const referralData = referralDoc.data();
      const affiliateWallet = referralData?.affiliateWallet;
      const projectId = referralData?.projectId;

      const projectDoc = await db.doc(`projects/${projectId}`).get();
      const projectData = projectDoc.data();
      const selectedTokenAddress = projectData?.selectedTokenAddress;
      const projectName = projectData?.projectName;

      const userDoc = await db.doc(`users/${affiliateWallet}`).get();
      const userData = userDoc.data();
      const email = userData?.email;

      const message = {
        type: "conversion_log_created",
        timestamp: newConversionLog.timestamp.toDate(),
        amount: newConversionLog.amount,
        affiliateWallet,
        selectedTokenAddress,
        email,
        referralId,
        projectPage: `https://www.0xqube.xyz/affiliate/${projectId}`,
        logId: context.params.logId,
        projectName,
      };
      await sendSlackNotification(message);
    }
  });

/**
 * Function triggered when an error is logged in Firestore.
 * Sends a Slack notification with error details.
 */
export const onErrorLogged = functions.firestore
  .document("errors/{errorId}")
  .onCreate(async (snap, context) => {
    const newErrorLog = snap.data();

    if (newErrorLog) {
      const message = {
        message: newErrorLog.errorMessage,
        type: newErrorLog.errorType,
        errorId: context.params.errorId,
      };
      await sendSlackNotification(message);
    }
  });

/**
 * Function triggered when a user's approval status changes.
 * Sends an email if the user is approved.
 */
export const sendApprovalEmail = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const newValue = change.after.data();
    const previousValue = change.before.data();

    if (previousValue.allowed === false && newValue.allowed === true) {
      const mailOptions = {
        from: qubeMailAddress,
        to: newValue.email,
        subject: "Access Approval Notification",
        html: `
          <div style="font-family: Arial, sans-serif;
                      line-height: 1.5;
                      background-color: #f4f4f4;
                      padding: 20px;">
            <div style="text-align: center;">
              <img src="https://www.0xqube.xyz/qube.png"
                   alt="Qube Logo"
                   style="width: 100px; height: auto;">
            </div>
            <div style="background-color: #ffffff;
                        padding: 20px;
                        border-radius: 10px;
                        margin-top: 20px;">
              <h2 style="color: #4CAF50; text-align: center;">
                Access Approved!
              </h2>
              <p>Your account with wallet address 
                 <strong>${userId}</strong> 
                 has been approved.</p>
              <p>You can now use Qube!</p>
              <p>Thank you for using our service.</p>
              <p>
                Please feel free to reach out to this e-mail if you have any
                questions:
                <a href="mailto:official@ceed.cloud">official@ceed.cloud</a>
              </p>
              <br>
              <p>Best regards,</p>
              <p>The Qube Team</p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://www.0xqube.xyz/"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="background-color: #4CAF50;
                          color: white;
                          padding: 10px 20px;
                          text-decoration: none;
                          border-radius: 5px;">Visit Qube</a>
              </div>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
      } catch (error: any) {
        console.error("Error sending email:", error);

        const errorLog = {
          errorType: "EmailSendError",
          errorMessage: error.message,
          additionalData: {
            userId: context.params.userId,
            email: newValue.email,
            functionName: "sendApprovalEmail",
          },
          createdAt: new Date(),
        };

        try {
          await db.collection("errors").add(errorLog);
          console.log("Error logged in Firestore.");
        } catch (logError) {
          console.error("Error saving log to Firestore:", logError);
        }
      }
    }
  });

// ============================
// Scheduled Triggers
// ============================

/**
 * Automated function that runs every Wednesday at 12 PM JST.
 * Fetches tweet engagement data and updates Firestore.
 */
export const automatedTweetEngagementUpdate = onSchedule(
  "0 3 * * 3",
  async () => {
    try {
      console.log("Starting automated tweet engagement update...");

      // Retrieve all referral IDs with a tweetUrl
      const referralIds: {
        tweetId: string,
        tweetUrl: string,
        referralId: string,
      }[] = [];
      const referralsSnapshot = await db.collection("referrals")
        .where("tweetUrl", "!=", "") // Get documents with a tweetUrl
        .get();

      // Extract tweetId from the retrieved documents
      referralsSnapshot.forEach((doc) => {
        const referralData = doc.data();
        const tweetUrl = referralData.tweetUrl;

        // Extract Tweet ID from the Tweet URL
        const tweetIdMatch = tweetUrl?.match(/status\/(\d+)/);
        if (tweetIdMatch && tweetIdMatch[1]) {
          referralIds.push({
            tweetId: tweetIdMatch[1],
            tweetUrl: tweetUrl,
            referralId: doc.id,
          });
        }
      });

      if (referralIds.length === 0) {
        console.log("No valid tweet URLs found.");
        await sendSlackNotification({message: "No valid tweet URLs found."});
        return;
      }

      console.log(
        `Processing tweet engagement data for ${referralIds.length} tweets.`
      );

      // Process API calls in batches of 100
      const batchSize = 100;
      const batchedTweetData: TweetEngagement[] = [];

      for (let i = 0; i < referralIds.length; i += batchSize) {
        const tweetBatch = referralIds.slice(i, i + batchSize);
        const tweetIdsBatch = tweetBatch.map((data) => data.tweetId).join(",");

        // Call X API endpoint to retrieve engagement data
        const url = `https://api.x.com/2/tweets?ids=${tweetIdsBatch}` +
                    "&tweet.fields=public_metrics";
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${X_API_BEARER_TOKEN}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Error fetching tweet engagement data: ${response.statusText}`
          );
          await sendSlackNotification({
            message:
              `Error fetching tweet engagement data: ${response.statusText}`,
          });
          continue; // Skip this batch if the API request fails
        }

        const engagementDataResponse = await response.json();
        const engagementDataArray = engagementDataResponse.data;

        // Map engagement data based on tweetId
        tweetBatch.forEach((tweetData) => {
          const matchingData = engagementDataArray.find(
            (engagement: { id: string }) => engagement.id === tweetData.tweetId
          );
          if (matchingData) {
            const engagementData = matchingData.public_metrics;
            batchedTweetData.push({
              referralId: tweetData.referralId,
              tweetUrl: tweetData.tweetUrl ?? "",
              retweetCount: engagementData.retweet_count,
              replyCount: engagementData.reply_count,
              likeCount: engagementData.like_count,
              quoteCount: engagementData.quote_count,
              bookmarkCount: engagementData.bookmark_count,
              impressionCount: engagementData.impression_count,
              fetchedAt: new Date(),
            });
          }
        });
      }

      if (batchedTweetData.length === 0) {
        console.log("No tweet engagement data available for update.");
        await sendSlackNotification({
          message: "No tweet engagement data available for update.",
        });
      } else {
        // Update Firestore with the new engagement data
        await updateTweetEngagement(batchedTweetData);
        console.log("Tweet engagement data successfully updated.");

        // Send the Slack notification
        // with separate fields for count and details
        await sendSlackNotification({
          message: "Tweet engagement data successfully updated.",
          numberOfRecords: batchedTweetData.length,
          details: JSON.stringify(batchedTweetData, null, 2),
        });
      }
    } catch (error: any) {
      console.error(
        "An error occurred during the tweet engagement update:",
        error
      );
      await sendSlackNotification({
        message:
          "An error occurred during the tweet engagement update: " +
          error.message,
      });
    }
  }
);
