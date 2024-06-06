import { collection, query, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidProjectData } from "../validations";
import { ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData } from "../../types";

export async function fetchProjectsByOwner(ownerAddress: string): Promise<ProjectData[]> {
  const projects: ProjectData[] = [];
  try {
    const q = query(collection(db, "projects"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ProjectData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
        lastPaymentDate?: Timestamp | null;
        deadline?: Timestamp;
      };

      if (isValidProjectData(data) && data.ownerAddresses.includes(ownerAddress)) {
        let projectData: ProjectData;

        if (data.projectType === "DirectPayment") {
          projectData = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            deadline: data.deadline?.toDate() || null,
          } as DirectPaymentProjectData;
        } else if (data.projectType === "EscrowPayment") {
          projectData = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            lastPaymentDate: data.lastPaymentDate?.toDate() || null,
          } as EscrowPaymentProjectData;
        } else {
          throw new Error("Unknown project type");
        }

        projects.push(projectData);
      }
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects by owner: ", error);
    throw new Error("Failed to fetch projects by owner");
  }
}
