import { runTransaction, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function processRewardPaymentTransaction(projectId: string, amount: number) {
  const projectRef = doc(db, "projects", projectId);

  try {
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      if (!projectDoc.exists()) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const projectData = projectDoc.data();
      const newTotalPaidOut = (projectData.totalPaidOut || 0) + amount;
      const newLastPaymentDate = new Date();

      transaction.update(projectRef, {
        totalPaidOut: newTotalPaidOut,
        lastPaymentDate: newLastPaymentDate
      });
    });
    console.log("Transaction successfully committed!");
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}
