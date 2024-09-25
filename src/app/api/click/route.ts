import { NextRequest, NextResponse } from "next/server";
import { logClickData, validateApiKey, fetchReferralData } from "../../utils/firebase";
import { fetchLocationData } from "../../utils/geo/fetchLocationData";
import { ClickData } from "../../types";

/**
 * Handles the POST request to log click data when a referral link is clicked.
 * It validates the API key, retrieves referral data, and fetches IP-based location data.
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Retrieve API key from request headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 400 }  // Bad Request - API key is required
      );
    }

    // Step 2: Extract referral, IP address, and user agent from request body
    const { referral, ip, userAgent } = await request.json();
    if (!referral || !ip || !userAgent) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }  // Bad Request - Missing necessary parameters
      );
    }

    // Step 3: Fetch referral data from Firestore using referral ID
    const referralData = await fetchReferralData(referral);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }  // Not Found - Referral data doesn't exist
      );
    }

    // Step 4: Validate the API key with the project ID from referral data
    const isValidApiKey = await validateApiKey(referralData.projectId, apiKey);
    if (!isValidApiKey) {
      return NextResponse.json(
        { error: "Invalid API key or access denied" },
        { status: 403 }  // Forbidden - API key invalid or access restricted
      );
    }

    // Step 5: Fetch geographic location data based on the provided IP address
    const locationData = await fetchLocationData(ip);

    // Step 6: Prepare click data object with location and user agent information
    const clickData: ClickData = {
      timestamp: new Date(),
      ip: ip,
      country: locationData?.country_name || "unknown",
      region: locationData?.region_name || "unknown",
      city: locationData?.city || "unknown",
      userAgent: userAgent,
    };

    // Step 7: Attempt to log click data in Firestore
    try {
      await logClickData(referral, clickData);
    } catch (error) {
      console.error("Failed to log click: ", error);
      return NextResponse.json(
        { error: "Failed to log click data" },
        { status: 500 }  // Internal Server Error - Failed to log click
      );
    }

    // Step 8: Return success response
    return NextResponse.json(
      { message: "Click logged successfully" },
      { status: 200 }  // Success - Click logged
    );

  } catch (error) {
    // Step 9: Catch any unhandled errors and return a generic error response
    console.error("Unexpected error: ", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }  // Internal Server Error - Generic catch-all for unexpected errors
    );
  }
}
