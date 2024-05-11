import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "./firebaseConfig";
import { deleteImageFromStorage } from "./deleteImageFromStorage";

/**
 * Deletes data for the specified project ID from Firestore.
 * @param {string} projectId - The ID of the project to delete
 */
export async function deleteProjectFromFirestore(projectId: string) {
  try {
    console.log(`Deleting data for projectId: ${projectId}`);

    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
    console.log("Project data has been deleted.");

    await deleteImageFromStorage(projectId, "logo");
    await deleteImageFromStorage(projectId, "cover");
    console.log("Image data has been deleted.");

    toast.success("Project data and images have been successfully deleted.");
  } catch (error: any) {
    console.error("Error during deleting project data and images:", error);
    toast.error(`Failed to delete project data and images: ${error.message}`);
    throw new Error(`Failed to delete project data and images: ${error.message}`);
    // TODO: Enhance error handling for data integrity issues:
    // 1. Implement detailed error logging and persistent storage in systems like ELK Stack or Splunk.
    // 2. Set up real-time alerts with severity levels for crucial system failures to notify admins via email, SMS, or Slack.
    // 3. Develop automated rollback and retry mechanisms to restore system to pre-error state or to handle transient failures.
    // 4. Prepare detailed guidelines and conduct regular training for effective error response.
    // These measures will ensure robust system operation and minimize impacts of potential failures.
  }
}
