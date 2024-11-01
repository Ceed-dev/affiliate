import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidProjectData } from "../validationUtils";
import { ProjectData } from "../../types";

/**
 * Fetches all projects associated with a specific owner from Firestore, validates, and formats them.
 * @param ownerAddress - The address of the project owner to filter projects by
 * @returns {Promise<ProjectData[]>} - An array of formatted project data objects
 * @throws {Error} - If there is an error during the fetch or data validation
 */
export async function fetchProjectsByOwner(ownerAddress: string): Promise<ProjectData[]> {
  const projects: ProjectData[] = [];
  const q = query(collection(db, "projects"), where("ownerAddresses", "array-contains", ownerAddress));

  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ProjectData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
        lastPaymentDate: Timestamp | null;
      };

      if (isValidProjectData(data)) {
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
    console.error("Error fetching projects by owner: ", error);
    throw new Error("Failed to fetch projects by owner");
  }
}