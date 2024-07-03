import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageType } from "../../types";

// A function to convert images to PNG format
const convertImageToPNG = async (file: any): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error("Failed to read file"));
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image to PNG"));
            }
          },
          "image/png"
        );
      };
      img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImageAndGetURL = async (file: any, projectId: string, imageType: ImageType): Promise<string | null> => {
  if (!file) return null;

  const storage = getStorage();
  let storageRef;

  if (imageType === "embed") {
    if (file.type === "image/png") {
      storageRef = ref(storage, `projectImages/${projectId}/embed_${projectId}.png`);
      await uploadBytes(storageRef, file);
    } else {
      const convertedFile = await convertImageToPNG(file);
      storageRef = ref(storage, `projectImages/${projectId}/embed_${projectId}.png`);
      await uploadBytes(storageRef, convertedFile);
    }
  } else {
    storageRef = ref(storage, `projectImages/${projectId}/${imageType}_${file.name}`);
    await uploadBytes(storageRef, file);
  }

  return await getDownloadURL(storageRef);
};