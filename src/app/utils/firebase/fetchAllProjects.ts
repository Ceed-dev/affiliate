import { db } from "./firebaseConfig";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { isValidProjectData } from "./projectValidation";
import { ProjectData } from "../../types";
import { toast } from "react-toastify";

export async function fetchAllProjects(): Promise<ProjectData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects: ProjectData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ProjectData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
        lastPaymentDate: Timestamp | null;
      };
      if (isValidProjectData(data)) {
        projects.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastPaymentDate: data.lastPaymentDate ? data.lastPaymentDate.toDate() : null
        });
      }
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects: ", error);
    toast.error("Failed to fetch projects");
    throw error;
  }
}
