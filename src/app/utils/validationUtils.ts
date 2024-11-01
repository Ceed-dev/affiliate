// External libraries
import { toast } from "react-toastify";
import { DocumentData } from "firebase/firestore";

// Project-specific types
import { ProjectData, ReferralData, ConversionPoint, Tier } from "../types";

/**
 * Validate the structure of project data to ensure it conforms to ProjectData type.
 * @param data - Firestore document data
 * @returns {boolean} - True if data conforms to ProjectData type, false otherwise
 */
export function isValidProjectData(data: DocumentData): data is ProjectData {
  // Validate individual conversion point structures based on paymentType
  const isValidConversionPoint = (point: any): point is ConversionPoint => {
    if (typeof point !== "object" || point === null) return false;
    
    switch (point.paymentType) {
      case "FixedAmount":
        return typeof point.rewardAmount === "number" && point.rewardAmount > 0 && point.rewardAmount <= 10000;
      case "RevenueShare":
        return typeof point.percentage === "number" && point.percentage > 0 && point.percentage <= 100;
      case "Tiered":
        return Array.isArray(point.tiers) && point.tiers.every(isValidTier);
      default:
        return false;
    }
  };

  // Validate that each tier in a Tiered payment type is correctly structured
  const isValidTier = (tier: any): tier is Tier => {
    return typeof tier.conversionsRequired === "number" && tier.conversionsRequired > 0 &&
           typeof tier.rewardAmount === "number" && tier.rewardAmount > 0;
  };

  // Validate the conversionPoints array within the project data
  const isValidConversionPoints = (points: ConversionPoint[]): boolean => {
    return Array.isArray(points) && points.every(isValidConversionPoint);
  };

  // Validate the full structure of a project with its conversion points
  return (
    typeof data.projectName === "string" &&
    typeof data.description === "string" &&
    typeof data.selectedChainId === "number" &&
    typeof data.selectedTokenAddress === "string" &&
    typeof data.logo === "string" &&
    typeof data.cover === "string" &&
    typeof data.websiteUrl === "string" &&
    typeof data.xUrl === "string" &&
    (typeof data.discordUrl === "string" || data.discordUrl === null || data.discordUrl === "") &&
    Array.isArray(data.ownerAddresses) &&
    data.ownerAddresses.every((address: any) => typeof address === "string") &&
    data.createdAt.toDate() instanceof Date &&
    data.updatedAt.toDate() instanceof Date &&
    typeof data.redirectUrl === "string" &&
    typeof data.totalPaidOut === "number" &&
    (data.lastPaymentDate === null || data.lastPaymentDate.toDate() instanceof Date) &&
    typeof data.isReferralEnabled === "boolean" &&
    isValidConversionPoints(data.conversionPoints)
  );
}

/**
 * Validates if the given Firestore document data conforms to the ReferralData type.
 * 
 * @param data - Firestore document data
 * @returns {boolean} - Returns true if the data is a valid ReferralData object, otherwise false.
 */
export function isValidReferralData(data: DocumentData): data is ReferralData {
  return (
    typeof data.affiliateWallet === "string" && // Validate affiliate's wallet address
    typeof data.projectId === "string" &&       // Validate project ID
    data.createdAt.toDate() instanceof Date &&  // Validate creation date
    typeof data.conversions === "number" &&     // Validate conversions count
    typeof data.earnings === "number" &&        // Validate earnings amount
    (data.lastConversionDate === null || data.lastConversionDate.toDate() instanceof Date) && // Validate last conversion date
    // Validate tweetNewestId if present, it must be a string
    (typeof data.tweetNewestId === "undefined" || typeof data.tweetNewestId === "string") &&
    // Validate tweetNewestCreatedAt if present, it must be a valid Date
    (typeof data.tweetNewestCreatedAt === "undefined" || data.tweetNewestCreatedAt.toDate() instanceof Date)
  );
}

/**
 * Validates the project data before saving or updating.
 * - Checks required fields, validates URLs, social link errors, token errors, etc.
 * - Displays error messages using `toast` if validation fails.
 *
 * @param projectData - The project data object to validate.
 * @param socialLinkFormError - Boolean indicating errors in social links form.
 * @param isNewProject - Boolean flag indicating if the validation is for a new project (default: true).
 * @param tokenError - Boolean indicating errors in token selection (required only for new projects).
 * @param conversionPoints - Array of conversion points associated with the project (required only for new projects).
 * @param redirectLinkError - Boolean indicating errors in the redirect URL field (required only for new projects).
 * @returns `true` if validation passes; `false` if validation fails.
 */
export const validateProjectData = (
  projectData: ProjectData,
  socialLinkFormError: boolean,
  isNewProject: boolean = true,
  tokenError?: boolean,
  conversionPoints?: ConversionPoint[],
  redirectLinkError?: boolean
): boolean => {
  // Check required text fields
  if (!projectData.projectName.trim()) {
    toast.error("Project name is required.");
    return false;
  }

  if (!projectData.description.trim()) {
    toast.error("Description is required.");
    return false;
  }

  if (!projectData.websiteUrl.trim()) {
    toast.error("Website URL is required.");
    return false;
  }

  if (!projectData.xUrl.trim()) {
    toast.error("X (Twitter) URL is required.");
    return false;
  }

  // Check for social link errors
  if (socialLinkFormError) {
    toast.error("Please correct errors in social links before proceeding.");
    return false;
  }

  // Check required media assets
  if (!projectData.cover) {
    toast.error("Cover image is required.");
    return false;
  }

  if (!projectData.logo) {
    toast.error("Logo image is required.");
    return false;
  }

  // Additional checks for new projects
  if (isNewProject) {
    // Check for token selection errors
    if (tokenError) {
      toast.error("Please correct the token selection errors before proceeding.");
      return false;
    }

    // Check for at least one conversion point
    if (!conversionPoints || conversionPoints.length === 0) {
      toast.error("At least one conversion point is required.");
      return false;
    }

    // Check Redirect URL requirements
    if (!projectData.redirectUrl.trim()) {
      toast.error("Redirect URL is required.");
      return false;
    }

    // Check for redirect link error
    if (redirectLinkError) {
      toast.error("Please correct the error in the redirect link before proceeding.");
      return false;
    }
  }

  // If all validations pass
  return true;
};