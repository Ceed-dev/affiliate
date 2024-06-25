import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { UserData } from "../../types";

export const fetchUnapprovedUsers = async (): Promise<UserData[]> => {
  try {
    const usersCollectionRef = collection(db, "users");
    const unapprovedUsersQuery = query(usersCollectionRef, where("allowed", "==", false));
    const querySnapshot = await getDocs(unapprovedUsersQuery);

    const unapprovedUsers: UserData[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserData & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };
      unapprovedUsers.push({
        ...userData,
        walletAddress: doc.id,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      } as UserData);
    });

    return unapprovedUsers;
  } catch (error) {
    console.error("Error fetching unapproved users:", error);
    return [];
  }
};
