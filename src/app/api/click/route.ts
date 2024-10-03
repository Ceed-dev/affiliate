import { NextRequest, NextResponse } from "next/server";
import { 
  logClickData, fetchReferralData, fetchProjectData,
  validateApiKey, logErrorToFirestore,
} from "../../utils/firebase";
import { fetchLocationData } from "../../utils/countryUtils";
import { ClickData, EscrowPaymentProjectData } from "../../types";

/**
 * Handles the GET request when a referral link is clicked.
 * Logs click data and redirects the user to either the provided target URL (if available) 
 * or the project-defined redirect URL retrieved from the database.
 * 
 * Two cases are handled:
 * 1. If a target URL (t) is provided in the query parameters, the user is redirected to that URL.
 * 2. If no target URL is provided, the project data is fetched from the database to obtain the redirect URL.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Extract referral ID and optional target URL from query parameters
    const { searchParams } = new URL(request.url);
    const referralId = searchParams.get("r");
    const targetUrl = searchParams.get("t");  // If the target URL is specified directly

    if (!referralId) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }  // Bad Request - Referral ID is required
      );
    }

    // Step 2: Retrieve IP address and user agent from request headers
    const ip = request.headers.get("x-forwarded-for") || request.ip;
    if (!ip) {
      return NextResponse.json(
        { error: "IP address not found" },
        { status: 400 }  // Bad Request - IP address is required
      );
    }
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Step 3: Try to fetch geographic location data based on the IP address
    let locationData;
    try {
      locationData = await fetchLocationData(ip);

      // Step 3a: If country_name is missing, handle as an error
      if (!locationData?.country_name) {
        await logErrorToFirestore("GeoLocationError", `Country unknown for IP: ${ip}`, {
          locationData,
          referralId,  // Include the referral ID in the error log
        });
        console.error("Location data fetch error: country_name is missing");

        // Skip logging click data and continue with the redirect
        if (targetUrl) {
          const decodedTargetUrl = decodeURIComponent(targetUrl);
          const url = new URL(decodedTargetUrl);
          url.searchParams.append("r", referralId);
          return NextResponse.redirect(url.toString(), 302);
        }
      }
    } catch (error: any) {
      // Step 3b: If fetching location data fails, log the error and continue without logging the click data
      await logErrorToFirestore("GeoLocationError", `Failed to retrieve location data for IP: ${ip}`, {
        error: error.message,
        referralId,
      });
      console.error("Location data fetch error: ", error);

      // Continue with the redirect without logging the click data
      if (targetUrl) {
        const decodedTargetUrl = decodeURIComponent(targetUrl);
        const url = new URL(decodedTargetUrl);
        url.searchParams.append("r", referralId);
        return NextResponse.redirect(url.toString(), 302);
      }
    }

    // Step 4: If location data is valid, log the click data
    if (locationData?.country_name) {
      const clickData: ClickData = {
        timestamp: new Date(),
        ip: ip,
        country: locationData.country_name,  // country_name is guaranteed to be valid here
        region: locationData?.region_name || "unknown",
        city: locationData?.city || "unknown",
        userAgent: userAgent,
      };

      await logClickData(referralId, clickData);
    }

    // Step 5: If a target URL is provided, skip project data retrieval and redirect
    if (targetUrl) {
      const decodedTargetUrl = decodeURIComponent(targetUrl);
      const url = new URL(decodedTargetUrl);
      url.searchParams.append("r", referralId);
      return NextResponse.redirect(url.toString(), 302);
    }

    // Step 6: Fetch referral data using the referral ID
    const referralData = await fetchReferralData(referralId);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }  // Not Found - Referral data doesn't exist
      );
    }

    // Step 7: Fetch project data using the projectId from referralData
    const projectData = await fetchProjectData(referralData.projectId);
    if (!projectData) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }  // Not Found - Project data doesn't exist
      );
    }

    // Step 8: Check if project type is EscrowPayment and retrieve the redirect URL
    let redirectUrl: string | null = null;
    if (projectData.projectType === "EscrowPayment") {
      redirectUrl = (projectData as EscrowPaymentProjectData).redirectUrl;
    } else {
      return NextResponse.json(
        { error: "Project type does not support redirection" },
        { status: 400 }  // Bad Request - Unsupported project type
      );
    }

    if (!redirectUrl) {
      return NextResponse.json(
        { error: "Redirect URL not found in project data" },
        { status: 500 }  // Internal Server Error - Redirect URL missing
      );
    }

    // Step 9: Redirect the user to the project's redirect URL with the referral ID as a query parameter
    const url = new URL(redirectUrl);
    url.searchParams.append("r", referralId);

    return NextResponse.redirect(url.toString(), 302);

  } catch (error) {
    console.error("Error processing click: ", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }  // Internal Server Error - Generic error handling
    );
  }
}

// ==================================================================================

/*
  [Comment]: The GET method has been added as the new primary flow for handling referral links.
  This GET method is now the preferred and future standard for use. However, the POST method
  is retained temporarily for projects like "DBR," where clients and existing affiliates 
  have already implemented the click API. This is to ensure that they do not need to immediately 
  update their referral links to the new format. 

  Both methods will coexist for a limited time until all referral links are transitioned to the new format.
*/

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

    // Step 6: Handle cases where location data is incomplete or invalid
    if (!locationData?.country_name) {
      // Log error to Firestore, including the referral and location data
      await logErrorToFirestore("GeoLocationError", `Country unknown for IP: ${ip}`, {
        locationData,
        referral,  // Include the referral data in the error log
      });

      // Return error message to the client
      return NextResponse.json(
        {
          error: "Failed to retrieve location data. Please ensure you are using a global IP address.",
        },
        { status: 400 }  // Bad Request - Location data could not be retrieved
      );
    }

    // Step 7: Prepare click data object with location and user agent information
    const clickData: ClickData = {
      timestamp: new Date(),
      ip: ip,
      country: locationData.country_name,  // No need for "unknown" since it's validated earlier
      region: locationData.region_name || "unknown",
      city: locationData.city || "unknown",
      userAgent: userAgent,
    };

    // Step 8: Attempt to log click data in Firestore
    try {
      await logClickData(referral, clickData);
    } catch (error) {
      console.error("Failed to log click: ", error);
      return NextResponse.json(
        { error: "Failed to log click data" },
        { status: 500 }  // Internal Server Error - Failed to log click
      );
    }

    // Step 9: Return success response
    return NextResponse.json(
      { message: "Click logged successfully" },
      { status: 200 }  // Success - Click logged
    );

  } catch (error) {
    // Step 10: Catch any unhandled errors and return a generic error response
    console.error("Unexpected error: ", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }  // Internal Server Error - Generic catch-all for unexpected errors
    );
  }
}
