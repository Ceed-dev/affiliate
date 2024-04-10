import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImageAndGetURL = async (file: any, projectId: string, imageType: string): Promise<string | null> => {
  if (!file) return null;
  const storage = getStorage();
  const storageRef = ref(storage, `projectImages/${projectId}/${imageType}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};