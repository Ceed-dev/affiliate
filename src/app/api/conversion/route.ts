import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_ORIGINS } from "../../constants/allowedOrigins";
import { ethers } from "ethers";
import { 
  fetchReferralData,
  validateApiKey,
  logConversion,
  fetchConversionLogsForReferrals,
} from "../../utils/firebase";
import { fetchProjects } from "../../utils/projectUtils";

/**
 * Handles the OPTIONS request for CORS preflight.
 * Checks if the request's origin is allowed, and sets the necessary CORS headers.
 * Only requests from origins listed in ALLOWED_ORIGINS will be permitted.
 * 
 * CORS headers:
 * - Access-Control-Allow-Credentials: Allows credentials to be sent with the request.
 * - Access-Control-Allow-Origin: Specifies the allowed origin if it matches the incoming request.
 * - Access-Control-Allow-Methods: Specifies the HTTP methods allowed (OPTIONS and POST).
 * - Access-Control-Allow-Headers: Specifies allowed headers for the request (x-api-key).
 */
export async function OPTIONS(req: NextRequest) {
  // Get the origin of the incoming request or set it to an empty string if null
  const origin = req.headers.get("origin") || "";
  
  // Check if the origin is in the allowed list; otherwise, set allowedOrigin to empty
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "";

  return NextResponse.json(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Access-Control-Allow-Headers": "x-api-key, Content-Type",
    },
  });
}

/**
 * Handles the POST request to log a conversion for a referral link.
 * Validates API keys, retrieves referral and project data, and processes reward payments.
 */
export async function POST(request: NextRequest) {
  try {
    // Retrieve the origin of the incoming request and check if it is allowed
    const origin = request.headers.get("origin") || "";

    // Set the allowed origin if it is in the list of approved origins, otherwise set to an empty string
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "";

    // Define CORS headers to manage cross-origin access
    const headers = {
      "Access-Control-Allow-Credentials": "true", // Allow credentials to be included with requests
      "Access-Control-Allow-Origin": allowedOrigin, // Set the allowed origin dynamically based on the incoming request
      "Access-Control-Allow-Methods": "OPTIONS,POST", // Specify which HTTP methods are permitted for the API
      "Access-Control-Allow-Headers": "x-api-key, Content-Type" // List allowed headers for requests
    };

    // Step 1: Retrieve API key from request headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 400 }  // Bad Request
      );
    }

    // Step 2: Extract referral and conversionId from request parameters
    const referral = request.nextUrl.searchParams.get("referral");
    if (!referral) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }  // Bad Request
      );
    }

    // Step 3: Fetch referral data from Firestore using referral ID
    const referralData = await fetchReferralData(referral);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }  // Not Found
      );
    }

    // Step 4: Handle special client cases for conversionId assignment
    let conversionId = request.nextUrl.searchParams.get("conversionId");
    if (referralData.projectId === "FX26BxKbDVuJvaCtcTDf") {
      conversionId = "L1TDOEA4";  // Special case for specific project
    }

    if (!conversionId) {
      return NextResponse.json(
        { error: "Conversion ID is missing" },
        { status: 400 }
      );
    }

    // Step 5: Validate API key for the given project ID
    const isValidApiKey = await validateApiKey(referralData.projectId, apiKey);
    if (!isValidApiKey) {
      return NextResponse.json(
        { error: "Invalid API key or access denied" },
        { status: 403 }  // Forbidden
      );
    }

    // Step 6: Fetch project data from Firestore
    const projectDataArray = await fetchProjects({ projectId: referralData.projectId });

    if (!projectDataArray || projectDataArray.length === 0) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }  // Not Found - Project data doesn't exist
      );
    }

    const projectData = projectDataArray[0]; // Retrieve the first project data

    // Step 7: Find the specific conversion point using conversionId
    const conversionPoint = projectData.conversionPoints.find(point => point.id === conversionId);
    if (!conversionPoint) {
      return NextResponse.json(
        { error: "Conversion point not found" },
        { status: 400 }
      );
    }

    // Step 8: Check if the conversion point is active
    if (!conversionPoint.isActive) {
      return NextResponse.json(
        { message: "Conversion point is inactive" },
        { status: 200 }  // OK, but cannot process conversion
      );
    }

    // Step 9: Determine reward amount based on payment type
    let rewardAmount = 0;
    if (conversionPoint.paymentType === "FixedAmount") {
      rewardAmount = conversionPoint.rewardAmount || 0;
    } else if (conversionPoint.paymentType === "RevenueShare") {
      const revenueParam = request.nextUrl.searchParams.get("revenue");
      if (!revenueParam || isNaN(parseFloat(revenueParam)) || parseFloat(revenueParam) <= 0) {
        return NextResponse.json(
          { error: "Invalid or missing revenue parameter for RevenueShare" },
          { status: 400 }
        );
      }
      const revenue = parseFloat(revenueParam);
      const percentage = conversionPoint.percentage || 0;
      // Calculate reward amount and round to 1 decimal place
      rewardAmount = Math.round((revenue * (percentage / 100)) * 10) / 10;
    } else if (conversionPoint.paymentType === "Tiered") {
      const conversionLogs = await fetchConversionLogsForReferrals([referralData], undefined, conversionId);
      const conversionCount = conversionLogs.length + 1;
      const appropriateTier = conversionPoint.tiers?.reverse().find(tier => conversionCount >= tier.conversionsRequired);
      if (!appropriateTier) {
        return NextResponse.json(
          { error: "No appropriate tier found" },
          { status: 400 }
        );
      }
      rewardAmount = appropriateTier.rewardAmount;
    }

    // Step 10: Handle referral feature (if enabled) and check user wallet address
    let userWalletAddress;
    if (projectData.isReferralEnabled) {
      userWalletAddress = request.nextUrl.searchParams.get("userWalletAddress");
      if (!userWalletAddress || !ethers.utils.isAddress(userWalletAddress)) {
        return NextResponse.json(
          { error: "Invalid or missing user wallet address" },
          { status: 400 }
        );
      }
    }

    // Step 11: Record successful conversions (without actual payment processing)
    await logConversion(`${referralData.id}`, conversionId, rewardAmount, userWalletAddress);

    // Step 12: Return success response
    return NextResponse.json(
      { message: "Conversion successful", referralId: referral },
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}