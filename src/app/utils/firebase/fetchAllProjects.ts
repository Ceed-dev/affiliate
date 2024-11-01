import { db } from "./firebaseConfig";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { isValidProjectData } from "../validationUtils";
import { ProjectData } from "../../types";
import { toast } from "react-toastify";

/**
 * Fetches all projects from Firestore, validates, and returns them in the correct format.
 * @returns {Promise<ProjectData[]>} - An array of formatted project data objects
 * @throws {Error} - If there is an error during the fetch or data validation
 */
export async function fetchAllProjects(): Promise<ProjectData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects: ProjectData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ProjectData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
        lastPaymentDate?: Timestamp | null;
      };

      if (isValidProjectData(data)) {
        // Helper function to convert Timestamp to Date
        const convertTimestamp = (timestamp?: Timestamp | null) => timestamp?.toDate() || null;

        // Format project data based on project type
        const projectData: ProjectData = {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastPaymentDate: convertTimestamp(data.lastPaymentDate),
        } as ProjectData;

        projects.push(projectData);
      }
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects: ", error);
    toast.error("Failed to fetch projects");
    throw error;
  }
}