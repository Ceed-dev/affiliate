import { v4 as uuidv4 } from "uuid";
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, Timestamp } from "firebase/firestore";
import { ApiKeyData } from "../../types";

const generateApiKey = (): string => {
  return uuidv4();
};

export const saveApiKeyToFirestore = async (projectId: string): Promise<string | null> => {
  const apiKey = generateApiKey();
  const apiKeyData: Omit<ApiKeyData, "projectId"> = {
    apiKey,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    lastUsedAt: null,
    usageCount: 0,
    isActive: true
  };

  try {
    await setDoc(doc(db, "apiKeys", projectId), apiKeyData);
    return apiKey;
  } catch (error) {
    console.error("Error saving API key: ", error);
    return null;
  }
};

export const getApiKeyData = async (projectId: string): Promise<ApiKeyData | null> => {
  try {
    const docRef = doc(db, "apiKeys", projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as ApiKeyData;

      const createdAt = (data.createdAt as unknown as Timestamp).toDate();
      const updatedAt = (data.updatedAt as unknown as Timestamp).toDate();
      const lastUsedAt = data.lastUsedAt ? (data.lastUsedAt as unknown as Timestamp).toDate() : null;

      return { 
        ...data, 
        projectId, 
        createdAt, 
        updatedAt, 
        lastUsedAt 
      };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting API key data: ", error);
    return null;
  }
};

const updateApiKeyUsage = async (projectId: string): Promise<boolean> => {
  try {
    const apiKeyRef = doc(db, "apiKeys", projectId);

    await updateDoc(apiKeyRef, {
      lastUsedAt: serverTimestamp(),
      usageCount: increment(1)
    });
    console.log("API key usage updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating API key usage: ", error);
    return false;
  }
};

export const validateApiKey = async (projectId: string, apiKey: string): Promise<boolean> => {
  try {
    const apiKeyData = await getApiKeyData(projectId);
    if (!apiKeyData || apiKeyData.apiKey !== apiKey) {
      return false;
    }
    if (apiKeyData.isActive) {
      const updateSuccess = await updateApiKeyUsage(projectId);
      if (!updateSuccess) {
        console.error("Failed to update API key usage");
        return false;
      }
    }
    return apiKeyData.isActive;
  } catch (error) {
    console.error("Error validating API key: ", error);
    return false;
  }
};