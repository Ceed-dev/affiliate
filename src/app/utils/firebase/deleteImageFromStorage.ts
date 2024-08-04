import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { ImageType } from "../../types";

const storage = getStorage();

/**
 * Deletes images from Firebase storage based on the project ID and image type.
 * If a file URL is provided, it deletes the specific file(s).
 * @param {string} projectId - The ID of the project.
 * @param {ImageType} type - The type of the image ("logo", "cover", or "embeds").
 * @param {string[]} [fileUrls] - The URLs of the specific files to delete.
 */
export const deleteImageFromStorage = async (projectId: string, type: ImageType, fileUrls?: string[]) => {
  try {
    if (type === "embeds" && fileUrls) {
      const deletePromises = fileUrls.map(url => {
        const filePath = url.split("/o/")[1].split("?")[0].replace(/%2F/g, "/");
        const fileRef = ref(storage, decodeURIComponent(filePath));
        return deleteObject(fileRef);
      });
      await Promise.all(deletePromises);
      console.log(`Deleted specified files in: projectImages/${projectId}/embeds/`);
    } else if (type === "logo" || type === "cover") {
      const storageRef = ref(storage, `projectImages/${projectId}/`);
      const listResult = await listAll(storageRef);
      const fileToDelete = listResult.items.find(item => item.name.startsWith(type));
      if (fileToDelete) {
        await deleteObject(fileToDelete);
        console.log(`Deleted: ${fileToDelete.fullPath}`);
      } else {
        console.log("No file matches the specified prefix.");
      }
    }
  } catch (error: any) {
    console.error("Error deleting file:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};
