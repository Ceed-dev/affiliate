import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { uploadImageAndGetURL } from "./uploadImageAndGetURL";
import { deleteImageFromStorage } from "./deleteImageFromStorage";
import { ImageType, ProjectData, EscrowPaymentProjectData } from "../../types";

/**
 * Updates project data in Firestore and handles image storage.
 * @param {string} projectId - The ID of the project to update.
 * @param {ProjectData} projectData - The new data for the project.
 * @param {string[]} deletedEmbedUrls - The URLs of the embed images to be deleted.
 * @param {(isLoading: boolean) => void} setIsLoading - Function to set loading state.
 * @returns {Promise<ProjectData>} The updated project data.
 */
export const updateProjectInFirestore = async (
  projectId: string,
  projectData: ProjectData, 
  // ==============================================
  // This code manages the embed images feature for affiliates to select and display ads within projects.
  // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
  // Uncomment to re-enable the embed images feature in the future.
  // deletedEmbedUrls: string[],
  // ==============================================
  setIsLoading: (isLoading: boolean) => void,
): Promise<ProjectData> => {
  setIsLoading(true);
  const updatedData = { ...projectData, updatedAt: new Date() };

  try {
    await handleImageUpdates(projectId, "logo", projectData, updatedData);
    await handleImageUpdates(projectId, "cover", projectData, updatedData);

    // ==============================================
    // This code manages the embed images feature for affiliates to select and display ads within projects.
    // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
    // Uncomment to re-enable the embed images feature in the future.
    // if (projectData.projectType === "EscrowPayment") {
    //   if (deletedEmbedUrls.length > 0) {
    //     await deleteImageFromStorage(projectId, "embeds", deletedEmbedUrls);
    //   }
    //   await handleEmbedImageUpdates(projectId, projectData as EscrowPaymentProjectData, updatedData as EscrowPaymentProjectData);
    // }
    // ==============================================

    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, updatedData);
    toast.success("Project updated successfully!");
    return updatedData;
  } catch (error: any) {
    console.error("Error updating project: ", error);
    toast.error("Error updating project: " + error.message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Handles the updates for project images (logo or cover).
 * Deletes old image and uploads new image, updating the provided updatedData object.
 * @param projectId - The ID of the project for which to handle images.
 * @param type - The type of the image, either "logo" or "cover".
 * @param projectData - The project data containing possible new image files.
 * @param updatedData - The project data object that will be updated with new image URLs.
 */
async function handleImageUpdates<T extends ProjectData>(
  projectId: string,
  type: "logo" | "cover",
  projectData: T,
  updatedData: T
) {
  const file = projectData[type as keyof T];
  if (file && file instanceof File) {
    await deleteImageFromStorage(projectId, type);
    const newImageURL = await uploadImageAndGetURL(file, projectId, type);
    updatedData[type as keyof T] = newImageURL as any;
  }
}

// ==============================================
// This code manages the embed images feature for affiliates to select and display ads within projects.
// Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
// Uncomment to re-enable the embed images feature in the future.
/**
 * Handles the updates for embed images.
 * Deletes the existing embed directory and uploads new embed images,
 * updating the provided updatedData object with the new image URLs.
 * @param projectId - The ID of the project for which to handle embed images.
 * @param projectData - The project data containing possible new embed image files.
 * @param updatedData - The project data object that will be updated with new embed image URLs.
 */
// async function handleEmbedImageUpdates(
//   projectId: string,
//   projectData: EscrowPaymentProjectData,
//   updatedData: EscrowPaymentProjectData
// ) {
//   const embedFiles = projectData.embeds;

//   // Keep track of already uploaded image URLs
//   const existingEmbeds = embedFiles.filter((embed): embed is string => typeof embed === "string");

//   // Upload new images and get their URLs
//   const newEmbeds = await Promise.all(
//     embedFiles.map(async (embed, index) => {
//       if (embed && embed instanceof File) {
//         return await uploadImageAndGetURL(embed, projectId, "embeds");
//       }
//       return null;
//     })
//   );

//   // Combine existing and new embed URLs
//   const allEmbeds = [
//     ...existingEmbeds,
//     ...newEmbeds.filter((url): url is string => url !== null)
//   ];

//   updatedData.embeds = allEmbeds;
// }
// ==============================================