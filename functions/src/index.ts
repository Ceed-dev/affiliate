import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {IncomingWebhook} from "@slack/webhook";
import * as nodemailer from "nodemailer";

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

// Cloud Firestore trigger for
// when a document is created in the "errors" collection
export const onErrorLogged = functions.firestore
  .document("errors/{errorId}")
  .onCreate(async (snap, context) => {
    const newErrorLog = snap.data();
    const errorId = context.params.errorId;

    if (newErrorLog) {
      const message = {
        message: newErrorLog.errorMessage,
        type: newErrorLog.errorType,
        errorId,
      };
      await sendSlackNotification(message);
    }
  });

const EMAIL_USER = functions.config().email.user;
const EMAIL_PASS = functions.config().email.pass;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const qubeMailAddress = "\"Qube\" <official@0xqube.xyz>";

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
