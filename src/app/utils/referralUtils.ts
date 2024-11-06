import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { fetchUserById } from "./userUtils";
import { isValidReferralData } from "./validationUtils";
import { ReferralData, ClickData, ConversionLog, AffiliatePerformanceData } from "../types/referralTypes";

/**
 * Fetches all referrals for a specific project, including user data, click data, and conversion data.
 *
 * @param {string} projectId - The ID of the project to fetch referrals for.
 * @returns {Promise<AffiliatePerformanceData[]>} - A promise resolving to an array of affiliate performance data.
 * 
 * This function retrieves referral documents associated with a specified project from Firestore.
 * For each referral, it fetches user information, click data, conversion data, and validates the referral structure.
 */
export async function fetchReferralPerformanceByProjectId(projectId: string): Promise<AffiliatePerformanceData[]> {
  const referrals: AffiliatePerformanceData[] = [];

  try {
    // Query referrals collection by project ID
    const q = query(collection(db, "referrals"), where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data() as ReferralData & {
        createdAt: Timestamp;
        lastConversionDate?: Timestamp | null;
        tweetNewestCreatedAt?: Timestamp | null;
      };

      // Process the referral data only if it is valid
      if (isValidReferralData(data)) {
        // Fetch user information for each referral
        const userData = await fetchUserById(data.affiliateWallet);
        const username = userData ? userData.username : "Unknown";

        // Fetch click data and conversion data associated with the referral
        const clicksData = await fetchClickDataByReferralId(docSnapshot.id);
        const conversionsData = await fetchConversionLogDataByReferralId(docSnapshot.id);

        // Construct affiliate performance data including clicks, conversions, and user info
        const referralData: AffiliatePerformanceData = {
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt.toDate(),
          lastConversionDate: data.lastConversionDate?.toDate() || null,
          username,
          clicks: clicksData,
          conversionLogs: conversionsData,
          tweetNewestId: data.tweetNewestId || undefined,
          tweetNewestCreatedAt: data.tweetNewestCreatedAt ? data.tweetNewestCreatedAt.toDate() : undefined,
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

/**
 * Fetches click data associated with a specific referral ID.
 *
 * @param {string} referralId - The ID of the referral for which to fetch click data.
 * @returns {Promise<ClickData[]>} - A promise resolving to an array of click data for the specified referral.
 */
async function fetchClickDataByReferralId(referralId: string): Promise<ClickData[]> {
  const clicksRef = collection(db, `referrals/${referralId}/clicks`);
  const clicksSnapshot = await getDocs(clicksRef);

  return clicksSnapshot.docs.map((doc) => {
    const clickData = doc.data();
    return {
      id: doc.id,
      timestamp: clickData.timestamp.toDate(),
      ip: clickData.ip || "Unknown",
      country: clickData.country || "Unknown",
      region: clickData.region || "Unknown",
      city: clickData.city || "Unknown",
      userAgent: clickData.userAgent || "Unknown",
      referralId,  // Directly include the referral ID (used in "WorldHeatmap" component)
    } as ClickData;
  });
}

/**
 * Fetches conversion log data associated with a specific referral ID.
 *
 * @param {string} referralId - The ID of the referral for which to fetch conversion log data.
 * @returns {Promise<ConversionLog[]>} - A promise resolving to an array of conversion logs for the specified referral.
 * 
 * This function retrieves all conversion log documents within the "conversionLogs" subcollection
 * of a referral document in Firestore, and returns them in a structured format.
 */
async function fetchConversionLogDataByReferralId(referralId: string): Promise<ConversionLog[]> {
  const conversionsRef = collection(db, `referrals/${referralId}/conversionLogs`);
  const conversionsSnapshot = await getDocs(conversionsRef);

  return conversionsSnapshot.docs.map((doc) => {
    const conversionData = doc.data();
    return {
      id: doc.id,
      timestamp: conversionData.timestamp.toDate(),
      amount: conversionData.amount,
      conversionId: conversionData.conversionId,
      isPaid: conversionData.isPaid,
      transactionHashAffiliate: conversionData.transactionHashAffiliate,
      paidAt: conversionData.paidAt ? conversionData.paidAt.toDate() : undefined,
      userWalletAddress: conversionData.userWalletAddress || undefined,
    } as ConversionLog;
  });
}