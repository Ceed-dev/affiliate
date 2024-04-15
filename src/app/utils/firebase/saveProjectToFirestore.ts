import { toast } from "react-toastify";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { doc, setDoc, collection } from "firebase/firestore";

import { db } from "./firebaseConfig";
import { uploadImageAndGetURL } from "./uploadImageAndGetURL";

import { ProjectData } from "../../types";

export const saveProjectToFirestore = async (
  projectData: ProjectData, 
  address: string,
  setIsLoading: (isLoading: boolean) => void,
  setHideCompleteButton: (hideCompleteButton: boolean) => void,
  nextStep: () => void,
  router: AppRouterInstance
) => {
  setIsLoading(true);

  const now = new Date();

  const projectRef = doc(collection(db, "projects"));
  const projectId = projectRef.id;

  const logoURL = await uploadImageAndGetURL(projectData.logo, projectId, "logo");
  const coverURL = await uploadImageAndGetURL(projectData.cover, projectId, "cover");

  const projectDataToSave = {
    ...projectData,
    logo: logoURL,
    cover: coverURL,
    ownerAddress: address,
    createdAt: now,
    updatedAt: now
  };

  try {
    await setDoc(projectRef, projectDataToSave);
    setHideCompleteButton(true);
    nextStep();
    console.log("Document written with ID: ", projectId);
    toast.success("Project saved successfully! Redirecting to the dashboard...", {
      onClose: () => router.push(`/projects/${projectId}`)
    });
    // 保存後に何かユーザーへのフィードバックを提供するか、または他のページへリダイレクト等
  } catch (e) {
    console.error("Error adding document: ", e);
    toast.error("Error saving project: " + e);
  } finally {
    setIsLoading(false);
  }
};