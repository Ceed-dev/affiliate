import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { ImageType } from "../../types";

export const uploadImageAndGetURL = async (file: any, projectId: string, imageType: ImageType): Promise<string | null> => {
  if (!file) return null;
  const storage = getStorage();
  const storageRef = ref(storage, `projectImages/${projectId}/${imageType}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};