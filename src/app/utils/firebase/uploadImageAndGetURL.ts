import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { ImageType } from "../../types";

// A function to convert images to PNG format
const convertImageToPNG = async (file: File): Promise<Blob> => {
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

export const uploadImageAndGetURL = async (file: File, projectId: string, imageType: ImageType): Promise<string | null> => {
  if (!file) return null;

  const storage = getStorage();
  let storageRef;

  if (imageType === "embeds") {
    const embedPath = `projectImages/${projectId}/embeds/embed_${uuidv4()}.png`;
    if (file.type === "image/png") {
      storageRef = ref(storage, embedPath);
      await uploadBytes(storageRef, file);
    } else {
      const convertedFile = await convertImageToPNG(file);
      storageRef = ref(storage, embedPath);
      await uploadBytes(storageRef, convertedFile);
    }
  } else {
    storageRef = ref(storage, `projectImages/${projectId}/${imageType}_${file.name}`);
    await uploadBytes(storageRef, file);
  }

  return await getDownloadURL(storageRef);
};