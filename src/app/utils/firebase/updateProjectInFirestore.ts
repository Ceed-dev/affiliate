import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { uploadImageAndGetURL } from "./uploadImageAndGetURL";
import { deleteImageFromStorage } from "./deleteImageFromStorage";
import { ProjectData} from "../../types";

/**
 * Updates project data in Firestore and handles image storage.
 * @param {string} projectId - The ID of the project to update.
 * @param {ProjectData} projectData - The new data for the project.
 * @returns {Promise<ProjectData>} The updated project data.
 */
export const updateProjectInFirestore = async (
  projectId: string,
  projectData: ProjectData, 
): Promise<ProjectData> => {
  const updatedData = { ...projectData, updatedAt: new Date() };

  try {
    await handleImageUpdates(projectId, "logo", projectData, updatedData);
    await handleImageUpdates(projectId, "cover", projectData, updatedData);

    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, updatedData);
    return updatedData;
  } catch (error: any) {
    console.error("Error updating project: ", error);
    throw error;
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