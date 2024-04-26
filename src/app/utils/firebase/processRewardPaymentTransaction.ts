import { runTransaction, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function processRewardPaymentTransaction(
  projectId: string, 
  referralId: string, 
  amount: number, 
  transactionHash: string
) {
  const now = new Date();

  const projectRef = doc(db, "projects", projectId);
  const transactionRef = doc(db, `referrals/${referralId}/paymentTransactions`, transactionHash);

  try {
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      if (!projectDoc.exists()) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const projectData = projectDoc.data();
      const newTotalPaidOut = (projectData.totalPaidOut || 0) + amount;
      const newLastPaymentDate = now;

      transaction.update(projectRef, {
        totalPaidOut: newTotalPaidOut,
        lastPaymentDate: newLastPaymentDate
      });

      transaction.set(transactionRef, {
        timestamp: now
      });
    });
    console.log("Transaction successfully committed!");
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}
