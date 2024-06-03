import { db } from "./firebaseConfig";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { isValidProjectData } from "../validations";
import { ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData } from "../../types";
import { toast } from "react-toastify";

export async function fetchAllProjects(): Promise<ProjectData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects: ProjectData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ProjectData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
        lastPaymentDate?: Timestamp | null;
        deadline?: Timestamp | null;
      };
      if (isValidProjectData(data)) {
        if (data.projectType === "DirectPayment") {
          const directPaymentProject = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            deadline: data.deadline?.toDate() || null,
          } as DirectPaymentProjectData;
          projects.push(directPaymentProject);
        } else if (data.projectType === "EscrowPayment") {
          const escrowPaymentProject = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            lastPaymentDate: data.lastPaymentDate?.toDate() || null,
          } as EscrowPaymentProjectData;
          projects.push(escrowPaymentProject);
        }
      }
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects: ", error);
    toast.error("Failed to fetch projects");
    throw error;
  }
}
