import { db } from "./firebaseConfig";
import { doc, getDoc, getDocs, setDoc, addDoc, collection, query, where } from "firebase/firestore";
import { UserData, ReferralData } from "../../types";
import { toast } from "react-toastify";
import { getExistingReferralId } from "./getExistingReferralId";

export async function joinProject(projectId: string, walletAddress: string): Promise<string> {
  const userDocRef = doc(db, "users", walletAddress);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // ユーザードキュメントが存在しない場合は新規作成
      const newUser: UserData = {
        joinedProjectIds: [projectId],
        conversions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await setDoc(userDocRef, newUser);
      toast.success("Your account has been created successfully!");
      // 新規ユーザー作成後はリファラルIDを作成
      return await createAndReturnNewReferralId(walletAddress, projectId);
    } else {
      // ユーザードキュメントが存在する場合
      const userData = userDoc.data() as UserData;
      if (userData.joinedProjectIds.includes(projectId)) {
        // ユーザーがプロジェクトに既に参加している場合は既存のリファラルIDを返す
        return await getExistingReferralId(walletAddress, projectId);
      } else {
        // 新たにプロジェクトIDを追加
        userData.joinedProjectIds.push(projectId);
        userData.updatedAt = new Date();
        await setDoc(userDocRef, userData);
        toast.success("You have successfully joined the project!");
        // 新規参加のためリファラルIDを作成
        return await createAndReturnNewReferralId(walletAddress, projectId);
      }
    }
  } catch (error) {
    console.error("Failed to join project: ", error);
    toast.error("Failed to join project");
    throw new Error("Failed to join project");
  }
}

async function createAndReturnNewReferralId(walletAddress: string, projectId: string): Promise<string> {
  const newReferral: ReferralData = {
    affiliateWallet: walletAddress,
    projectId: projectId,
    createdAt: new Date(),
    conversions: 0,
    earnings: 0
  };
  const referralDocRef = await addDoc(collection(db, "referrals"), newReferral);
  toast.success("Your referral link has been generated successfully!");
  return referralDocRef.id;
}