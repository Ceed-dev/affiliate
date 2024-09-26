import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidReferralData } from "../validationUtil";
import { ReferralData, ExtendedReferralData, UserData, ClickData } from "../../types";

export async function fetchReferralsByProjectId(projectId: string): Promise<ExtendedReferralData[]> {
  const referrals: ExtendedReferralData[] = [];
  try {
    const q = query(collection(db, "referrals"), where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
        tweetEngagement?: {
          retweetCount: number;
          replyCount: number;
          likeCount: number;
          quoteCount: number;
          bookmarkCount: number;
          impressionCount: number;
          fetchedAt: Timestamp;
        }
      };

      if (isValidReferralData(data)) {
        const userDocRef = doc(db, "users", data.affiliateWallet);
        const userDocSnapshot = await getDoc(userDocRef);

        let username = "";
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data() as UserData;
          username = userData.username;
        }

        // Get click data from the subcollection "clicks"
        const clicksRef = collection(db, `referrals/${docSnapshot.id}/clicks`);
        const clicksSnapshot = await getDocs(clicksRef);
        const clicksData = clicksSnapshot.docs.map((doc) => {
          const clickData = doc.data();
          return {
            id: doc.id,
            timestamp: clickData.timestamp.toDate(),
            ip: clickData.ip || "Unknown",
            country: clickData.country || "Unknown",
            region: clickData.region || "Unknown",
            userAgent: clickData.userAgent || "Unknown"
          } as ClickData;
        });

        const referralData: ExtendedReferralData = {
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt.toDate(),
          lastConversionDate: data.lastConversionDate?.toDate() || null,
          username,
          clicks: clicksData,
          tweetUrl: data.tweetUrl || "",
          tweetEngagement: data.tweetEngagement
            ? {
                ...data.tweetEngagement,
                fetchedAt: data.tweetEngagement.fetchedAt.toDate(), // Convert fetchedAt timestamp to Date
              }
            : undefined,
        };
        referrals.push(referralData);
      }
    }

    return referrals;
  } catch (error) {
    console.error("Error fetching referrals by projectId: ", error);
    throw new Error("Failed to fetch referrals by projectId");
  }
}
