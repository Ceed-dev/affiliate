import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { FeaturedProjectData, MarketplaceBannerData } from "../types/appSettingsTypes";

/**
 * Retrieves the featured project data from the appSettings collection in Firestore.
 *
 * @returns {Promise<FeaturedProjectData | null>} - The featured project data or null if not found.
 */
export async function getFeaturedProject(): Promise<FeaturedProjectData | null> {
  try {
    const docRef = doc(db, "appSettings", "featuredProject");
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return {
        projectId: data.projectId ?? null,  // Ensure projectId is either a string or null
        lastUpdated: data.lastUpdated.toDate(),
      };
    } else {
      console.warn("No featured project found in appSettings.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching featured project:", error);
    throw new Error("Failed to fetch featured project.");
  }
}

/**
 * Updates the featured project data in the appSettings collection in Firestore.
 *
 * @param {string | null} projectId - The ID of the project to set as featured, or null to clear the featured project.
 * @returns {Promise<void>} - Resolves when the update is complete.
 */
export async function updateFeaturedProject(projectId: string | null): Promise<void> {
  try {
    const docRef = doc(db, "appSettings", "featuredProject");
    await updateDoc(docRef, {
      projectId: projectId,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Error updating featured project:", error);
    throw new Error("Failed to update featured project.");
  }
}

/**
 * Retrieves the marketplace banner data from the appSettings collection in Firestore.
 *
 * @returns {Promise<MarketplaceBannerData | null>} - The marketplace banner data or null if not found.
 */
export async function getMarketplaceBanner(): Promise<MarketplaceBannerData | null> {
  try {
    const docRef = doc(db, "appSettings", "marketplaceBanner");
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return {
        message: data.message ?? null,  // Ensure message is either a string or null
        lastUpdated: data.lastUpdated.toDate(),
      };
    } else {
      console.warn("No marketplace banner found in appSettings.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching marketplace banner:", error);
    throw new Error("Failed to fetch marketplace banner.");
  }
}

/**
 * Updates the marketplace banner data in the appSettings collection in Firestore.
 *
 * @param {string | null} message - The message to display in the banner, or null to clear the banner.
 * @returns {Promise<void>} - Resolves when the update is complete.
 */
export async function updateMarketplaceBanner(message: string | null): Promise<void> {
  try {
    const docRef = doc(db, "appSettings", "marketplaceBanner");
    await updateDoc(docRef, {
      message: message,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Error updating marketplace banner:", error);
    throw new Error("Failed to update marketplace banner.");
  }
}