import { ref, listAll, deleteObject, getStorage } from "firebase/storage";
import { db } from "./firebaseConfig";
import { collection, doc, getDocs, query, where, runTransaction, deleteDoc, DocumentReference, CollectionReference } from "firebase/firestore";
import { logErrorToFirestore } from "./logErrorToFirestore";

const storage = getStorage();

// Function to delete all files in Firebase Storage
const deleteAllFilesInFolder = async (folderPath: string) => {
  try {
    const folderRef = ref(storage, folderPath);
    const listResult = await listAll(folderRef);

    const deletePromises = listResult.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    console.log(`All files in folder ${folderPath} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete files in folder ${folderPath}:`, error);
    await logErrorToFirestore("ImageDeletionError", `Failed to delete files in folder ${folderPath}`, { error });
    throw new Error(`Failed to delete files in folder ${folderPath}`);
  }
};

/**
 * Recursively deletes all subcollections for a given document.
 * 
 * @param docRef - Reference to the document whose subcollections are to be deleted.
 * @param subcollectionNames - An array of subcollection names to delete (e.g., `['clicks', 'conversionLogs']`).
 */
const deleteSubcollectionsRecursively = async (
  docRef: DocumentReference,
  subcollectionNames: string[]
) => {
  for (const subcollectionName of subcollectionNames) {
    const subcollectionRef: CollectionReference = collection(docRef, subcollectionName);
    const subDocsSnapshot = await getDocs(subcollectionRef);

    for (const subDoc of subDocsSnapshot.docs) {
      // Recursively call this function if nested subcollections exist (optional)
      await deleteDoc(subDoc.ref);
    }
  }
};

/**
 * Deletes referral documents and their subcollections for a given project ID.
 * 
 * @param projectId - The ID of the project whose referrals and subcollections should be deleted.
 */
const deleteReferralsAndSubcollections = async (projectId: string) => {
  const referralQuery = query(collection(db, "referrals"), where("projectId", "==", projectId));
  const referralSnapshot = await getDocs(referralQuery);

  for (const referralDoc of referralSnapshot.docs) {
    // Define the subcollections to delete (e.g., clicks and conversionLogs)
    const subcollectionsToDelete = ["clicks", "conversionLogs", "paymentTransactions", "tweets", "youtubeVideos"];

    // Delete subcollections for each referral document
    await deleteSubcollectionsRecursively(referralDoc.ref, subcollectionsToDelete);

    // Delete the referral document itself
    await deleteDoc(referralDoc.ref);
  }

  console.log(`Referrals and related subcollections for project ${projectId} deleted successfully.`);
};

// Project deletion function (including storage deletion)
export const deleteProjectFromFirebase = async (projectId: string) => {
  try {
    await runTransaction(db, async (transaction) => {
      // Step 1: Remove the project from the projects collection
      const projectDocRef = doc(db, "projects", projectId);
      transaction.delete(projectDocRef);
      console.log(`Project ${projectId} marked for deletion in projects collection.`);

      // Step 2: Delete the corresponding API key from the apiKeys collection
      const apiKeyDocRef = doc(db, "apiKeys", projectId);
      transaction.delete(apiKeyDocRef);
      console.log(`API Key for project ${projectId} marked for deletion in apiKeys collection.`);

      // Step 3: Remove the corresponding project ID from joinedProjectIds for each user in the users collection.
      const userSnapshot = await getDocs(collection(db, "users"));
      userSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.joinedProjectIds && Array.isArray(userData.joinedProjectIds)) {
          const updatedProjectIds = userData.joinedProjectIds.filter((id: string) => id !== projectId);
          transaction.update(doc(db, "users", userDoc.id), { joinedProjectIds: updatedProjectIds });
        }
      });
      console.log(`Project ${projectId} removed from joinedProjectIds in users collection.`);
    });

    // Step 4: Delete referrals and related subcollections
    await deleteReferralsAndSubcollections(projectId);

    // Step 5: Delete the images for the project from Firebase Storage
    const projectImagesPath = `projectImages/${projectId}`;
    const embedsPath = `projectImages/${projectId}/embeds`;

    // Delete the images in the main folder and the embeds folder
    await deleteAllFilesInFolder(projectImagesPath);  // Top-level images
    await deleteAllFilesInFolder(embedsPath);         // Images in the embeds folder

    console.log(`Project ${projectId} and its related data deleted successfully.`);
  } catch (error) {
    console.error("Error deleting project and related data: ", error);
    throw new Error("Failed to delete project.");
  }
};
