// External libraries
import { toast } from "react-toastify";
import { DocumentData } from "firebase/firestore";
import { ethers } from "ethers";
import { z } from "zod";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

// Project-specific types
import { ProjectData, ReferralData, ConversionPoint, Tier, SelectedToken } from "../types";

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

  // Validate the selectedToken object structure
  const isValidSelectedToken = (token: any): token is SelectedToken => {
    return (
      typeof token === "object" &&
      token !== null &&
      typeof token.chainId === "number" &&
      typeof token.address === "string" &&
      typeof token.symbol === "string"
    );
  };

  // Validate the full structure of a project with its conversion points
  return (
    typeof data.projectName === "string" &&
    typeof data.description === "string" &&
    isValidSelectedToken(data.selectedToken) &&
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
    // Check if selectedToken has both address and symbol
    if (!projectData.selectedToken.address || !projectData.selectedToken.symbol) {
      toast.error("Both token address and symbol are required.");
      return false;
    }

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
 * Zod schema for validating the structure of a conversion request.
 * 
 * This schema is used to validate the request body sent to the conversion API. 
 * It ensures the presence and validity of required fields and optional fields, 
 * such as referralId, conversionId, revenue, and userWalletAddress.
 * 
 * @example
 * const validationResult = conversionRequestSchema.safeParse(requestBody);
 * if (!validationResult.success) {
 *   // Handle validation error
 * }
 */
export const conversionRequestSchema = z.object({
  /**
   * Referral ID - a required string field that identifies the referral.
   */
  referralId: z.string().min(1, "Referral ID is required."),

  /**
   * Conversion ID - a required string field that identifies the conversion point.
   */
  conversionId: z.string().min(1, "Conversion ID is required."),

  /**
   * Revenue - an optional numeric field representing the revenue amount. 
   * If provided, it must be a positive number.
   */
  revenue: z
    .number({ invalid_type_error: "Revenue must be a number." })
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: "Revenue must be greater than zero.",
    }),

  /**
   * User Wallet Address - an optional string field representing the user's wallet address.
   * If provided, it must be a valid Ethereum address.
   */
  userWalletAddress: z
    .string()
    .optional()
    .refine((val) => !val || ethers.utils.isAddress(val), {
      message: "Invalid wallet address.",
    }),
});

/**
 * Adds security headers to the response to enhance application security.
 *
 * These headers help mitigate various attacks, such as XSS, clickjacking, and information leakage,
 * by setting strict policies for the browser.
 *
 * @param response - The Next.js response object to which security headers will be applied.
 */
export const applySecurityHeaders = (response: NextResponse) => {
  /**
   * Prevents DNS prefetching to reduce the risk of information leakage to external servers.
   * Value: "off" - Disables DNS prefetching.
   */
  response.headers.set("X-DNS-Prefetch-Control", "off");

  /**
   * Enforces HTTPS communication and prevents the browser from using HTTP.
   * Value: "max-age=15552000; includeSubDomains" - Forces HTTPS for 180 days and applies the rule to all subdomains.
   */
  response.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");

  /**
   * Disables MIME type sniffing to prevent the browser from interpreting files differently from their declared content type.
   * Value: "nosniff" - Instructs the browser to strictly follow the declared Content-Type header.
   */
  response.headers.set("X-Content-Type-Options", "nosniff");

  /**
   * Prevents clickjacking attacks by restricting the use of the page in an iframe.
   * Value: "SAMEORIGIN" - Allows the page to be embedded in iframes only on the same origin.
   */
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  /**
   * Disables the browser's built-in XSS protection.
   * Value: "0" - Turns off XSS protection to avoid potential conflicts or vulnerabilities from its implementation.
   */
  response.headers.set("X-XSS-Protection", "0");

  /**
   * Controls how much referrer information is included with requests made from the page.
   * Value: "no-referrer" - No referrer information will be sent with requests.
   */
  response.headers.set("Referrer-Policy", "no-referrer");

  /**
   * Restricts the sources from which the browser can load resources such as scripts, styles, and media.
   * Value: "default-src 'self'; script-src 'self'" - Allows resources only from the same origin.
   */
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self';");
};

// Rate limiter configuration
const rateLimiter = new LRUCache<string, number>({
  max: 1000, // Maximum number of cache entries (supports up to 1000 unique API keys)
  ttl: 60 * 60 * 1000, // Cache expiration time (1 hour in milliseconds)
  allowStale: false, // Do not allow stale (expired) entries to be used
});

/**
 * Checks if the provided API key has exceeded the rate limit.
 * This function ensures that each API key can only make a limited
 * number of requests (300 requests per hour in this implementation).
 * 
 * How it works:
 * - Retrieves the current request count for the given API key.
 * - If the count exceeds or equals the limit (300), it returns `false`
 *   indicating that the request should be rejected.
 * - Otherwise, it increments the count for the API key, resets its TTL,
 *   and returns `true` to allow the request.
 * 
 * Why use `LRUCache`:
 * - Efficient in-memory storage to track API key usage.
 * - Automatically evicts the least recently used entries when the `max`
 *   limit is reached.
 * - Ensures that outdated entries (older than 1 hour) are not used
 *   for rate-limiting decisions.

 * @param apiKey - The API key to check.
 * @returns {boolean} - Returns `true` if the request is allowed, `false` otherwise.
 */
export function checkRateLimit(apiKey: string): boolean {
  // Retrieve the current request count for the API key, defaulting to 0
  const currentCount = rateLimiter.get(apiKey) || 0;

  // If the request count exceeds the limit (300 requests/hour), reject the request
  if (currentCount >= 300) {
    return false; // Rate limit exceeded
  }

  // Increment the request count and update the cache
  rateLimiter.set(apiKey, currentCount + 1);

  // Allow the request
  return true;
}