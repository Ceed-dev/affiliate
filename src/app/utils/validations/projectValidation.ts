import { DocumentData } from "firebase/firestore";
import { ProjectData, WhitelistedAddress } from "../../types";

export function isValidProjectData(data: DocumentData): data is ProjectData {
  // Helper function to add validation for `whitelistedAddresses`
  const isValidWhitelistedAddresses = (addresses: any): boolean => {
    if (typeof addresses !== "object" || addresses === null) {
      return false;
    }
    return Object.entries(addresses).every(([key, value]) => 
      typeof key === "string" && isValidWhitelistedAddress(value)
    );
  };

  // Validate a single address entry against the WhitelistedAddress interface
  const isValidWhitelistedAddress = (address: any): address is WhitelistedAddress => {
    return typeof address === "object" &&
           typeof address.redirectUrl === "string" &&
           typeof address.rewardAmount === "number";
  };

  return (
    typeof data.projectName === "string" &&
    typeof data.description === "string" &&
    typeof data.selectedTokenAddress === "string" &&
    typeof data.rewardAmount === "number" &&
    typeof data.redirectUrl === "string" &&
    (data.logo === null || typeof data.logo === "string") &&
    (data.cover === null || typeof data.cover === "string") &&
    typeof data.websiteUrl === "string" &&
    typeof data.discordUrl === "string" &&
    typeof data.xUrl === "string" &&
    typeof data.instagramUrl === "string" &&
    typeof data.ownerAddress === "string" &&
    data.createdAt.toDate() instanceof Date &&
    data.updatedAt.toDate() instanceof Date &&
    typeof data.totalPaidOut === "number" &&
    (data.lastPaymentDate === null || data.lastPaymentDate.toDate() instanceof Date) &&
    isValidWhitelistedAddresses(data.whitelistedAddresses)
  );
}