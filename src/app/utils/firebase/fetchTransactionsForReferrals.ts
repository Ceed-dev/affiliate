import { collection, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PaymentTransaction, ReferralData } from "../../types";

export const fetchTransactionsForReferrals = async (referralData: ReferralData[], setTransactionData: Function): Promise<void> => {
  const transactions: PaymentTransaction[] = [];
  for (const referral of referralData) {
    const transactionsRef = collection(db, "referrals", `${referral.id}`, "paymentTransactions");
    const q = query(transactionsRef);
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      transactions.push({
        transactionHash: doc.id,
        timestamp: data.timestamp.toDate(),
      });
    });
  }

  setTransactionData(transactions);
  console.log("transactions: ", transactions);
};