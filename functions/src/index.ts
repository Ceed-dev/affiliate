import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {IncomingWebhook} from "@slack/webhook";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Slack Webhook URL
const SLACK_WEBHOOK_URL = functions.config().slack.webhook_url;

// Initialize Slack Webhook
const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

/**
 * Function to send a Slack notification
 * @param {object} message - The message to send to Slack
 */
async function sendSlackNotification(message: object): Promise<void> {
  await webhook.send({
    text: JSON.stringify(message, null, 2),
  });
}

// Cloud Firestore trigger for
// when a document is created in the "users" collection
export const onUserCreated = functions.firestore
  .document("users/{walletAddress}")
  .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const walletAddress = context.params.walletAddress;

    if (newUser) {
      let userType: string;
      if (newUser.joinedProjectIds.length === 0) {
        userType = "Client";
      } else {
        userType = "Affiliate";
      }

      const message = {
        type: "user_created",
        walletAddress,
        createdAt: newUser.createdAt.toDate(),
        username: newUser.username,
        email: newUser.email,
        xProfileUrl: newUser.xProfileUrl,
        userType,
      };
      await sendSlackNotification(message);
    }
  });

// Cloud Firestore trigger for when a document is created
// in the "conversionLogs" collection
export const onConversionLogCreated = functions.firestore
  .document("referrals/{referralId}/conversionLogs/{logId}")
  .onCreate(async (snap, context) => {
    const newConversionLog = snap.data();
    const referralId = context.params.referralId;
    const logId = context.params.logId;

    if (newConversionLog) {
      // Get the affiliateWallet from the referral document
      const referralDoc = await db.doc(`referrals/${referralId}`).get();
      const referralData = referralDoc.data();
      const affiliateWallet = referralData?.affiliateWallet;

      // Get the selectedTokenAddress from the project document
      const projectId = referralData?.projectId;
      const projectDoc = await db.doc(`projects/${projectId}`).get();
      const projectData = projectDoc.data();
      const selectedTokenAddress = projectData?.selectedTokenAddress;
      const projectName = projectData?.projectName;

      // Get the email from the users collection
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
        logId,
        projectName,
      };
      await sendSlackNotification(message);
    }
  });
