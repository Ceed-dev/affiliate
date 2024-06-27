import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export const checkIfProjectOwner = async (walletAddress: string): Promise<boolean> => {
  const projectsCollectionRef = collection(db, "projects");
  const q = query(projectsCollectionRef, where("ownerAddresses", "array-contains", walletAddress));
  const querySnapshot = await getDocs(q);
  
  return !querySnapshot.empty;
};
