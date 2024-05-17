import { toast } from "react-toastify";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { uploadImageAndGetURL } from "./uploadImageAndGetURL";
import { ProjectData } from "../../types";

export const saveProjectToFirestore = async (
  projectData: ProjectData, 
  address: string,
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
      ownerAddress: address,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(projectRef, projectDataToSave);
    console.log("Document written with ID: ", projectId);
    // TODO: 一時的にプロジェクトデータ保存成功通知を非表示にする。
    // - Reason: 一時的にトークンのApproveとDeposit機能を無効にして最終的な成功通知は元の関数内に実装してあるため、
    // ここでのこのステップに関する通知は一時的に非表示にする。
    // - Planned Reversion: 未定。
    // - Date: 2024-05-17
    // - Author: shungo0222
    // - Issue: #314
    // ===== BEGIN ORIGINAL CODE =====
    // toast.success("Project saved to Firestore successfully!");
    // ===== END ORIGINAL CODE =====
    return { projectId: projectId };
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred while saving the project.";
    console.error("Error adding document: ", errorMessage);
    return null;
  }
};