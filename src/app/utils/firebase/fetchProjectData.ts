import { doc, getDoc, DocumentData } from "firebase/firestore";

import { db } from "./firebaseConfig";
import { ProjectData } from "../../types";

function isValidProjectData(data: DocumentData): data is ProjectData {
  return (
    typeof data.projectName === "string" &&
    typeof data.slug === "string" &&
    typeof data.description === "string" &&
    typeof data.selectedToken === "string" &&
    typeof data.rewardAmount === "number" &&
    typeof data.redirectUrl === "string" &&
    (data.logo === null || typeof data.logo === "string") &&
    (data.cover === null || typeof data.cover === "string") &&
    typeof data.websiteUrl === "string" &&
    typeof data.discordUrl === "string" &&
    typeof data.twitterUrl === "string" &&
    typeof data.instagramUrl === "string" &&
    typeof data.ownerAddress === "string" &&
    Array.isArray(data.affiliateAddress) &&
    data.createdAt.toDate() instanceof Date &&
    data.updatedAt.toDate() instanceof Date
  );
}

export async function fetchProjectData(projectId: string): Promise<ProjectData> {
  const docRef = doc(db, "projects", projectId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && isValidProjectData(docSnap.data())) {
      const data = docSnap.data();
      const projectData = {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as ProjectData;
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