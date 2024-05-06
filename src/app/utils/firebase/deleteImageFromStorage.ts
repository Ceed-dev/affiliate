import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { ImageType } from "../../types";

const storage = getStorage();

/**
 * Deletes an image from Firebase storage based on the project ID and image type.
 * @param {string} projectId - The ID of the project.
 * @param {ImageType} type - The type of the image ("logo" or "cover").
 */
export const deleteImageFromStorage = async (projectId: string, type: ImageType) => {
  const storageRef = ref(storage, `projectImages/${projectId}/`);
  try {
    const listResult = await listAll(storageRef);
    const fileToDelete = listResult.items.find(item => item.name.startsWith(type));

    if (fileToDelete) {
      await deleteObject(fileToDelete);
      console.log(`Deleted: ${fileToDelete.fullPath}`);
    } else {
      console.log("No file matches the specified prefix.");
    }
  } catch (error: any) {
    console.error("Error deleting file:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};
