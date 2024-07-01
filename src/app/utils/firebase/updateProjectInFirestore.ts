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
 * @param {(isLoading: boolean) => void} setIsLoading - Function to set loading state.
 * @returns {Promise<ProjectData>} The updated project data.
 */
export const updateProjectInFirestore = async (
  projectId: string,
  projectData: ProjectData, 
  setIsLoading: (isLoading: boolean) => void,
): Promise<ProjectData> => {
  setIsLoading(true);
  const updatedData = { ...projectData, updatedAt: new Date() };

  try {
    await handleImageUpdates(projectId, "logo", projectData, updatedData);
    await handleImageUpdates(projectId, "cover", projectData, updatedData);

    if (projectData.projectType === "EscrowPayment") {
      await handleImageUpdates(projectId, "embed", projectData as EscrowPaymentProjectData, updatedData as EscrowPaymentProjectData);
    }

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
 * Handles the updates for project images (logo, cover, or embed).
 * Deletes old image and uploads new image, updating the provided updatedData object.
 * @param projectId - The ID of the project for which to handle images.
 * @param type - The type of the image, either "logo", "cover", or "embed".
 * @param projectData - The project data containing possible new image files.
 * @param updatedData - The project data object that will be updated with new image URLs.
 */
async function handleImageUpdates<T extends ProjectData>(
  projectId: string,
  type: ImageType,
  projectData: T,
  updatedData: T
) {
  const file = projectData[type as keyof T];
  if (file && typeof file === "object" && "name" in file) {
    await deleteImageFromStorage(projectId, type);
    const newImageURL = await uploadImageAndGetURL(file, projectId, type);
    updatedData[type as keyof T] = newImageURL as any;
  }
}