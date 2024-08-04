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

    let logoURL: string | null = null;
    if (projectData.logo instanceof File) {
      logoURL = await uploadImageAndGetURL(projectData.logo, projectId, "logo");
    }

    let coverURL: string | null = null;
    if (projectData.cover instanceof File) {
      coverURL = await uploadImageAndGetURL(projectData.cover, projectId, "cover");
    }

    const projectDataToSave = {
      ...projectData,
      logo: logoURL ?? (projectData.logo as string),
      cover: coverURL ?? (projectData.cover as string),
      createdAt: now,
      updatedAt: now
    };

    if (projectData.projectType === "EscrowPayment") {
      const escrowProjectData = projectData as EscrowPaymentProjectData;

      const embedURLs = await Promise.all(
        escrowProjectData.embeds.map((embed, index) =>
          embed instanceof File ? uploadImageAndGetURL(embed, projectId, "embeds") : embed
        )
      );
      (projectDataToSave as EscrowPaymentProjectData).embeds = embedURLs.filter((url): url is string => url !== null);
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