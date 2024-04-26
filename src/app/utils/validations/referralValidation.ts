import { DocumentData } from "firebase/firestore";
import { ReferralData } from "../../types";

export function isValidReferralData(data: DocumentData): data is ReferralData {
  return (
    typeof data.affiliateWallet === "string" &&
    typeof data.projectId === "string" &&
    data.createdAt.toDate() instanceof Date &&
    typeof data.conversions === "number" &&
    typeof data.earnings === "number" &&
    (data.lastConversionDate === null || data.lastConversionDate.toDate() instanceof Date)
  );
}