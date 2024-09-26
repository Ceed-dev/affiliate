import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isValidProjectData } from "../validationUtils";
import { ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData } from "../../types";

export async function fetchProjectData(projectId: string): Promise<ProjectData> {
  const docRef = doc(db, "projects", projectId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && isValidProjectData(docSnap.data())) {
      const data = docSnap.data() as ProjectData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
        lastPaymentDate?: Timestamp | null;
        deadline?: Timestamp | null;
      };

      let projectData: ProjectData;

      if (data.projectType === "DirectPayment") {
        projectData = {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          deadline: data.deadline?.toDate() || null,
        } as DirectPaymentProjectData;
      } else if (data.projectType === "EscrowPayment") {
        projectData = {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastPaymentDate: data.lastPaymentDate?.toDate() || null,
        } as EscrowPaymentProjectData;
      } else {
        throw new Error("Unknown project type");
      }

      console.log("Document data:", JSON.stringify(projectData, null, 2));
      return projectData;
    } else {
      console.log("No such document or data is invalid!");
      throw new Error("No such project or data validation failed");
    }
  } catch (error) {
    console.error("Error fetching project data: ", error);
    throw new Error("Failed to fetch project");
  }
}