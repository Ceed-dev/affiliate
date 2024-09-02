import { DocumentData } from "firebase/firestore";
import { 
  ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData, 
  WhitelistedAddress, ConversionPoint, Tier,
} from "../../types";

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

  // Additional helper functions for slots and budget
  const isValidSlots = (slots: any): boolean => {
    return typeof slots === "object" &&
           typeof slots.total === "number" &&
           typeof slots.remaining === "number";
  };

  const isValidBudget = (budget: any): boolean => {
    return typeof budget === "object" &&
           typeof budget.total === "number" &&
           typeof budget.remaining === "number";
  };

  // Base project data validation
  const isValidBaseProjectData = (data: any): boolean => {
    return (
      typeof data.projectName === "string" &&
      typeof data.description === "string" &&
      typeof data.selectedChainId === "number" &&
      typeof data.selectedTokenAddress === "string" &&
      typeof data.logo === "string" &&
      typeof data.cover === "string" &&
      typeof data.websiteUrl === "string" &&
      typeof data.xUrl === "string" &&
      typeof data.discordUrl === "string" &&
      Array.isArray(data.ownerAddresses) &&
      data.ownerAddresses.every((address: any) => typeof address === "string") &&
      data.createdAt.toDate() instanceof Date &&
      data.updatedAt.toDate() instanceof Date
    );
  };

  // Helper function to validate `conversionPoints`
  const isValidConversionPoints = (points: ConversionPoint[]): boolean => {
    return points.every(point => isValidConversionPoint(point));
  };

  // Helper function to validate a single `ConversionPoint`
  const isValidConversionPoint = (point: any): point is ConversionPoint => {
    if (typeof point !== "object" || point === null) {
      return false;
    }
    
    if (typeof point.id !== "string" || typeof point.paymentType !== "string" || typeof point.isActive !== "boolean") {
      return false;
    }
    
    switch (point.paymentType) {
      case "FixedAmount":
        return typeof point.rewardAmount === "number";
      case "RevenueShare":
        return typeof point.percentage === "number";
      case "Tiered":
        return Array.isArray(point.tiers) && point.tiers.every(isValidTier);
      default:
        return false;
    }
  };

  // Helper function to validate `Tier`
  const isValidTier = (tier: any): tier is Tier => {
    return typeof tier.conversionsRequired === "number" &&
          typeof tier.rewardAmount === "number";
  };

  // DirectPayment project data validation
  const isValidDirectPaymentProjectData = (data: any): data is DirectPaymentProjectData => {
    return (
      isValidBaseProjectData(data) &&
      isValidWhitelistedAddresses(data.whitelistedAddresses) &&
      isValidSlots(data.slots) &&
      isValidBudget(data.budget) &&
      data.deadline.toDate() instanceof Date
    );
  };

  // EscrowPayment project data validation
  const isValidEscrowPaymentProjectData = (data: any): data is EscrowPaymentProjectData => {
    return (
      isValidBaseProjectData(data) &&
      typeof data.redirectUrl === "string" &&
      typeof data.totalPaidOut === "number" &&
      (data.lastPaymentDate === null || data.lastPaymentDate.toDate() instanceof Date) &&
      Array.isArray(data.embeds) &&
      data.embeds.every((embed: any) => typeof embed === "string") &&
      typeof data.isReferralEnabled === "boolean" &&
      Array.isArray(data.conversionPoints) &&
      isValidConversionPoints(data.conversionPoints)
    );
  };

  // Check the project type and validate accordingly
  if (data.projectType === "DirectPayment") {
    return isValidDirectPaymentProjectData(data);
  } else if (data.projectType === "EscrowPayment") {
    return isValidEscrowPaymentProjectData(data);
  }

  return false;
}