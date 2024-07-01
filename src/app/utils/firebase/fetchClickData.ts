import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { ClickData } from "../../types";

export const fetchClickData = async (referralId: string): Promise<ClickData[]> => {
  try {
    const clicksCollectionRef = collection(db, `referrals/${referralId}/clicks`);
    const q = query(clicksCollectionRef, where("timestamp", "!=", null));
    const querySnapshot = await getDocs(q);
    const clicks: ClickData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ClickData & {
        timestamp: Timestamp;
      }
      clicks.push({
        ...data,
        timestamp: data.timestamp.toDate(),
      } as ClickData);
    });
    return clicks;
  } catch (error) {
    console.error("Error fetching click data: ", error);
    return [];
  }
};
