import { db } from "./firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc, Timestamp, Query, query, where } from "firebase/firestore";
import { CampaignData } from "../types/campaign";

/**
 * Fetches and formats campaign data from Firestore.
 * This function can fetch a single campaign, all campaigns, or campaigns filtered by owner address.
 *
 * @param options - Options to customize the query
 * @returns {Promise<CampaignData[]>} - Array of formatted campaign data objects
 */
export async function fetchCampaigns(options: {
  campaignId?: string;
  ownerAddress?: string;
  audienceCountry?: string;
  joinedCampaignIds?: string[];
  onEachCampaign?: (campaign: CampaignData) => void;
} = {}): Promise<CampaignData[]> {
  const { campaignId, ownerAddress, audienceCountry, joinedCampaignIds, onEachCampaign } = options;

  try {
    let querySnapshot;
    let docSnap;

    if (campaignId) {
      // Fetch a single campaign by ID
      const docRef = doc(db, "campaigns", campaignId);
      docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("No such campaign found");
      }
    } else {
      // Construct the Firestore query
      const campaignCollection = collection(db, "campaigns");
      let q: Query = campaignCollection;

      // Add ownerAddress filter if provided
      if (ownerAddress) {
        q = query(q, where("members." + ownerAddress, "!=", null)); // Campaign members include the owner
      }

      // Add audienceCountry filter if provided
      if (audienceCountry) {
        q = query(q, where("targeting.audienceCountries", "array-contains", audienceCountry));
      }

      q = query(q, where("settings.isVisibleOnMarketplace", "==", true)); // Only fetch visible campaigns

      querySnapshot = await getDocs(q);
    }

    const campaigns: CampaignData[] = [];
    const campaignIds = new Set<string>();

    const processDoc = (docData: any, docId: string) => {
      const convertTimestamp = (timestamp?: Timestamp | null) => timestamp?.toDate() || null;

      const campaignData: CampaignData = {
        ...docData,
        id: docId,
        timestamps: {
          createdAt: convertTimestamp(docData.timestamps?.createdAt),
          updatedAt: convertTimestamp(docData.timestamps?.updatedAt),
        },
      };

      onEachCampaign?.(campaignData);
      return campaignData;
    };

    if (docSnap) {
      const data = docSnap.data();
      campaigns.push(processDoc(data, docSnap.id));
    } else if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
    
        // Check if campaign is visible on the marketplace
        // If ownerAddress is provided, ignore isVisibleOnMarketplace
        if (ownerAddress || data.settings.isVisibleOnMarketplace) {
          campaigns.push(processDoc(data, doc.id));
          campaignIds.add(doc.id);
        }
      });
    }

    // Add joinedCampaignIds that are not already in the campaign list
    if (joinedCampaignIds && joinedCampaignIds.length > 0) {
      const missingCampaignIds = joinedCampaignIds.filter((id) => !campaignIds.has(id));

      for (const campaignId of missingCampaignIds) {
        const docRef = doc(db, "campaigns", campaignId);
        const campaignDoc = await getDoc(docRef);

        if (campaignDoc.exists()) {
          campaigns.push(processDoc(campaignDoc.data(), campaignDoc.id));
        }
      }
    }

    return campaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw new Error("Failed to fetch campaigns");
  }
}