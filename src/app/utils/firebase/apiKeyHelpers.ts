import { v4 as uuidv4 } from "uuid";
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
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