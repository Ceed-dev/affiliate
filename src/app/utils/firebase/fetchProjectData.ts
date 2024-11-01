import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidProjectData } from "../validationUtils";
import { ProjectData } from "../../types";

/**
 * Fetches project data from Firestore, validates, and returns it in the correct format.
 * @param projectId - ID of the project document to fetch
 * @returns {Promise<ProjectData>} - The formatted project data
 * @throws {Error} - If the project doesn't exist or validation fails
 */
export async function fetchProjectData(projectId: string): Promise<ProjectData> {
  const docRef = doc(db, "projects", projectId);

  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || !isValidProjectData(docSnap.data())) {
      throw new Error("No such project or data validation failed");
    }

    const data = docSnap.data() as ProjectData & {
      createdAt: Timestamp;
      updatedAt: Timestamp;
      lastPaymentDate: Timestamp | null;
    };

    // Helper function for Timestamp conversion to Date
    const convertTimestamp = (timestamp?: Timestamp | null) => timestamp?.toDate() || null;

    // Apply type-specific fields
    const projectData: ProjectData = {
      ...data,
      id: docSnap.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      lastPaymentDate: convertTimestamp(data.lastPaymentDate),
    } as ProjectData;

    return projectData;
  } catch (error) {
    console.error("Error fetching project data: ", error);
    throw new Error("Failed to fetch project");
  }
}