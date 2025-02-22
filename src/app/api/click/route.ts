import { NextRequest, NextResponse } from "next/server";
import { 
  logClickData, fetchReferralData,
  validateApiKey, logErrorToFirestore,
} from "../../utils/firebase";
import { fetchProjects } from "../../utils/projectUtils";
import { fetchLocationData } from "../../utils/countryUtils";
import { checkRateLimit } from "../../utils/validationUtils";
import { ClickData } from "../../types";

/**
 * Handles the GET request when a referral link is clicked.
 * Logs click data and redirects the user to either the provided target URL (if available)
 * or the project-defined redirect URL retrieved from the database.
 *
 * This function also handles tracking parameters such as:
 * - `r` (referralId): Used to track the affiliate referral.
 * - `click_id` (optional): Passed from ASP and forwarded to the destination to maintain tracking consistency.
 *
 * Two cases are handled:
 * 1. If a target URL (`t`) is provided in the query parameters, the user is redirected to that URL.
 *    - The referral ID (`r`) and `click_id` (if available) are appended to the target URL.
 * 2. If no target URL is provided, the project data is fetched from the database to obtain the redirect URL.
 *    - The referral ID (`r`) and `click_id` (if available) are appended to the project's redirect URL.
 *
 * Additional Features:
 * - Retrieves IP-based geolocation data to log country and city information.
 * - Implements rate limiting to prevent excessive tracking requests.
 * - Logs errors if geolocation data is unavailable or request processing fails.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Extract referral ID and optional target URL from query parameters
    const { searchParams } = new URL(request.url);
    const referralId = searchParams.get("r");
    const targetUrl = searchParams.get("t");  // If the target URL is specified directly
    const clickId = searchParams.get("click_id");

    if (!referralId) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }  // Bad Request - Referral ID is required
      );
    }

    // Step 2: Retrieve IP address and user agent from request headers
    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : request.ip;
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

          // Add the appropriate parameter based on the link type
          if (decodedTargetUrl.startsWith("https://t.me/")) {
            url.searchParams.append("startapp", referralId); // Telegram Mini App link
          } else {
            url.searchParams.append("r", referralId); // Standard link
            if (clickId) {
              url.searchParams.append("click_id", clickId);
            }
          }
          
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

        // Add the appropriate parameter based on the link type
        if (decodedTargetUrl.startsWith("https://t.me/")) {
          url.searchParams.append("startapp", referralId); // Telegram Mini App link
        } else {
          url.searchParams.append("r", referralId); // Standard link
          if (clickId) {
            url.searchParams.append("click_id", clickId);
          }
        }

        return NextResponse.redirect(url.toString(), 302);
      }
    }

    // Step 4: Rate limit check
    const clickKey = `${referralId}-${ip}`;
    const isRateLimitAllowed = checkRateLimit(clickKey, "click");

    // Step 5: If location data is valid, log the click data
    if (isRateLimitAllowed && locationData?.country_name) {
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

    // Step 6: If a target URL is provided, skip project data retrieval and redirect
    if (targetUrl) {
      const decodedTargetUrl = decodeURIComponent(targetUrl);
      const url = new URL(decodedTargetUrl);

      // Add referralId only if rate limit is allowed
      if (isRateLimitAllowed) {
        // Add the appropriate parameter based on the link type
        if (decodedTargetUrl.startsWith("https://t.me/")) {
          url.searchParams.append("startapp", referralId); // Telegram Mini App link
        } else {
          url.searchParams.append("r", referralId); // Standard link
          if (clickId) {
            url.searchParams.append("click_id", clickId);
          }
        }
      }

      return NextResponse.redirect(url.toString(), 302);
    }

    // Step 7: Fetch referral data using the referral ID
    const referralData = await fetchReferralData(referralId);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }  // Not Found - Referral data doesn't exist
      );
    }

    // Step 8: Fetch project data using the projectId from referralData
    const projectDataArray = await fetchProjects({ projectId: referralData.projectId });

    if (!projectDataArray || projectDataArray.length === 0) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }  // Not Found - Project data doesn't exist
      );
    }

    const projectData = projectDataArray[0]; // Retrieve the first project data

    // Step 9: Redirect the user to the project's redirect URL with the referral ID as a query parameter
    const url = new URL(projectData.redirectUrl);

    // Add referralId only if rate limit is allowed
    if (isRateLimitAllowed) {
      if (projectData.redirectUrl.startsWith("https://t.me/")) {
        url.searchParams.append("startapp", referralId); // Telegram Mini App link
      } else {
        url.searchParams.append("r", referralId); // Standard link
        if (clickId) {
          url.searchParams.append("click_id", clickId);
        }
      }
    }

    return NextResponse.redirect(url.toString(), 302);

  } catch (error) {
    console.error("Error processing click: ", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }  // Internal Server Error - Generic error handling
    );
  }
}