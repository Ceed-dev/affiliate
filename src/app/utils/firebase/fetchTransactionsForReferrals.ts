import { collection, query, getDocs, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PaymentTransaction, ReferralData } from "../../types";

export const fetchTransactionsForReferrals = async (referralData: ReferralData[], setTransactionData: Function): Promise<void> => {
  try {
    const transactions: PaymentTransaction[] = [];
    const transactionPromises = referralData.map(async (referral) => {
      const transactionsRef = collection(db, "referrals", `${referral.id}`, "paymentTransactions");
      const q = query(transactionsRef);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData & { timestamp: Timestamp };
        transactions.push({
          transactionHash: doc.id,
          timestamp: data.timestamp.toDate(),
        });
      });
    });

    await Promise.all(transactionPromises);

    setTransactionData(transactions);
    console.log("transactions: ", transactions);
  } catch (error) {
    console.error("Error fetching transactions for referrals: ", error);
    throw new Error("Failed to fetch transactions for referrals");
  }
};