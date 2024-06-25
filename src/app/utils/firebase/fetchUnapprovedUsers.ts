import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserData } from "../../types";

export const fetchUnapprovedUsers = async (): Promise<UserData[]> => {
  try {
    const usersCollectionRef = collection(db, "users");
    const unapprovedUsersQuery = query(usersCollectionRef, where("allowed", "==", false));
    const querySnapshot = await getDocs(unapprovedUsersQuery);

    const unapprovedUsers: UserData[] = [];
    querySnapshot.forEach((doc) => {
      unapprovedUsers.push(doc.data() as UserData);
    });

    return unapprovedUsers;
  } catch (error) {
    console.error("Error fetching unapproved users:", error);
    return [];
  }
};
