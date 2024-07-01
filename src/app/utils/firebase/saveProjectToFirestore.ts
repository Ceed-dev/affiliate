import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { uploadImageAndGetURL } from "./uploadImageAndGetURL";
import { ProjectData, EscrowPaymentProjectData } from "../../types";

export const saveProjectToFirestore = async (
  projectData: ProjectData
): Promise<{ projectId: string } | null> => {
  try {
    const now = new Date();

    const projectRef = doc(collection(db, "projects"));
    const projectId = projectRef.id;

    const logoURL = await uploadImageAndGetURL(projectData.logo, projectId, "logo");
    const coverURL = await uploadImageAndGetURL(projectData.cover, projectId, "cover");

    const projectDataToSave = {
      ...projectData,
      logo: logoURL,
      cover: coverURL,
      createdAt: now,
      updatedAt: now
    };

    if (projectData.projectType === "EscrowPayment") {
      const escrowProjectData = projectData as EscrowPaymentProjectData;
      const embedURL = await uploadImageAndGetURL(escrowProjectData.embed, projectId, "embed");
      (projectDataToSave as EscrowPaymentProjectData).embed = embedURL;
    }

    await setDoc(projectRef, projectDataToSave);
    console.log("Document written with ID: ", projectId);
    
    return { projectId: projectId };
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred while saving the project.";
    console.error("Error adding document: ", errorMessage);
    return null;
  }
};