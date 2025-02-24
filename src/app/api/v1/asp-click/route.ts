import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, doc, getDoc, increment, runTransaction, Timestamp } from "firebase/firestore";
import crypto from "crypto";
import { fetchLocationData } from "../../../utils/countryUtils";
import { logErrorToFirestore } from "../../../utils/firebase";

/**
 * Fetches a document from Firestore and throws an error if not found.
 */
async function getDocumentOrThrow(collectionName: string, docId: string, errorMessage: string) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(errorMessage);
  }
  return docSnap.data();
}

/**
 * Handles GET requests for the ASP click tracking API.
 *
 * This endpoint is triggered when an ASP redirects users to Qube via a tracking link.
 * The request should include an "id" parameter that corresponds to an ASP campaign.
 *
 * Functionality:
 * - Retrieves ASP campaign data from Firestore
 * - Validates required parameters from the query string
 * - Fetches geolocation data based on the user's IP address
 * - Stores click event data in Firestore
 * - Updates click statistics in Firestore
 * - Generates and stores a unique tracking ID
 * - Redirects the user to the final destination URL with the tracking ID
 * - Logs errors to Firestore for debugging and monitoring
 *
 * Expected Query Parameters:
 * - id: The ASP campaign ID (required)
 * - Other parameters based on ASP-specific mappings
 *
 * Responses:
 * - 200: Successful redirection with tracking ID
 * - 400: Bad request (missing parameters, invalid data)
 * - 404: Resource not found (ASP campaign, project, or required data missing)
 * - 500: Internal server error (unexpected failures or transaction errors)
 *
 * Logs:
 * - Errors related to missing or invalid data
 * - Transaction failures
 * - Geolocation retrieval failures
 */
export async function GET(req: NextRequest) {
  try {
    console.log("📥 [INFO] Received ASP click request");

    // Extract and validate required parameters from the request
    const { searchParams } = new URL(req.url);
    const aspCampaignId = searchParams.get("id");

    if (!aspCampaignId) {
      return NextResponse.json(
        {
          error: "Missing required 'id' parameter",
          message: "The request is missing the 'id' parameter and cannot be processed.",
          action: "Please provide the required parameter and try again.",
        },
        { status: 400 }
      );
    }

    // Retrieve IP address and User-Agent
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.ip ?? "";
    const userAgent = req.headers.get("user-agent") ?? "unknown";

    if (!ip) {
      return NextResponse.json(
        { error: "IP address not found" },
        { status: 400 }
      );
    }

    // Initialize error tracking for GeoLocation failures
    let geoLocationError = false;
    let geoLocationErrorDetails: { error: string; aspCampaignId: string } | null = null;

    // Fetch GeoLocation data
    const locationData = await fetchLocationData(ip).catch(async (error) => {
      console.error("⚠️ [WARNING] Failed to retrieve location data:", error.message);
      geoLocationError = true;
      geoLocationErrorDetails = {
        error: error.message,
        aspCampaignId,
      };
      return null;
    });

    // Fetch ASP campaign data from Firestore
    let aspCampaignData;
    try {
      aspCampaignData = await getDocumentOrThrow("aspCampaignLinks", aspCampaignId, "ASP Campaign not found");
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const campaignId = aspCampaignData.ids?.campaignId;
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID not found in ASP Campaign" }, { status: 400 });
    }

    // Fetch project data from Firestore
    let projectData;
    try {
      projectData = await getDocumentOrThrow("projects", campaignId, "Project not found");
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const redirectUrl = projectData.redirectUrl;
    if (!redirectUrl) {
      return NextResponse.json({ error: "Redirect URL not found in Project" }, { status: 400 });
    }

    // Generate a unique tracking ID
    const trackingId = crypto.randomBytes(6).toString("hex");

    // Fetch ASP data for parameter mappings
    let aspData;
    try {
      aspData = await getDocumentOrThrow("asps", aspCampaignData.ids.aspId, "ASP data not found");
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const paramMappings = aspData.paramMappings || [];

    // Extract required inbound parameters
    const requiredParams = paramMappings
      .map(({ inboundName }: any) => inboundName)
      .filter((name: any) => typeof name === "string" && name.trim().length > 0);

    // Check for missing required parameters
    const missingParams = requiredParams.filter((param: any) => !searchParams.get(param));

    if (missingParams.length > 0) {
      return NextResponse.json(
        { 
          error: "Missing required parameters",
          message: `The request is missing required parameters and cannot be processed. Missing parameters: ${missingParams.join(", ")}`,
          action: "If this issue persists, please contact support."
        },
        { status: 400 }
      );
    }

    // Extract parameters based on mappings
    const params: Record<string, string | null> = {};
    paramMappings.forEach(({ inboundName, defaultValue }: any) => {
      if (typeof inboundName === "string" && inboundName.trim().length > 0) {
        params[inboundName] = searchParams.get(inboundName) ?? defaultValue ?? null;
      }
    });

    // Construct location object
    const location = {
      city: locationData?.city || null,
      country: locationData?.country_name || null,
      ip: ip,
      region: locationData?.region_name || null,
    };

    // Execute Firestore transaction
    try {
      await runTransaction(db, async (transaction) => {
        const aspCampaignRef = doc(db, "aspCampaignLinks", aspCampaignId);
        const aspCampaignSnap = await transaction.get(aspCampaignRef);
        if (!aspCampaignSnap.exists()) {
          throw new Error("ASP Campaign not found");
        }

        // Create Click Log
        const clickLogRef = doc(collection(db, `aspCampaignLinks/${aspCampaignId}/clickLogs`));
        transaction.set(clickLogRef, {
          ids: {
            trackingId,
            conversionLogId: null, // Initially set to `null`
          },
          params,
          location,
          userAgent,
          timestamp: Timestamp.now(),
        });

        // Update Click Statistics in `aspCampaignLinks`
        const currentDate = new Date();
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dd = String(currentDate.getDate()).padStart(2, "0");

        transaction.update(aspCampaignRef, {
          [`clickStats.total`]: increment(1),
          [`clickStats.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
          [`clickStats.byMonth.${yyyy}-${mm}`]: increment(1),
          [`timestamps.updatedAt`]: Timestamp.now(),
          ...(location.country && { [`clickStats.byCountry.${location.country}`]: increment(1) }),
        });

        // Store Tracking ID
        const trackingRef = doc(db, "trackingIds", trackingId);
        transaction.set(trackingRef, {
          ids: {
            affiliatorId: aspCampaignData.ids.aspId,
            campaignId: aspCampaignData.ids.campaignId,
            linkId: aspCampaignId,
            clickLogId: clickLogRef.id,
          },
          status: "active",
          timestamps: {
            createdAt: Timestamp.now(),
            expiresAt: null,
          },
          type: "ASP",
        });

        if (geoLocationError && geoLocationErrorDetails) {
          await logErrorToFirestore(
            "GeoLocationError",
            `(ASP) Failed to retrieve location data for IP: ${ip}, Click Log ID: ${clickLogRef.id}`,
            geoLocationErrorDetails
          );
          console.log("📝 [INFO] GeoLocationError log recorded after successful transaction.");
        }
      });

      console.log("✅ [SUCCESS] Transaction completed successfully");
    } catch (error: any) {
      console.error("❌ [ERROR] Transaction failed", error.message);

      // TODO: Log this transaction failure into Firestore for debugging and monitoring
      // Example:
      // await logErrorToFirestore("TransactionError", "Failed to process transaction", { 
      //   error: error.message, 
      //   aspCampaignId 
      // });

      return NextResponse.json(
        {
          error: "Transaction failed. Please try again.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    const url = new URL(redirectUrl);
    url.searchParams.append("trackingId", trackingId);
    const finalRedirectUrl = url.toString();

    return NextResponse.redirect(finalRedirectUrl);
  } catch (error: any) {
    console.error("❌ [ERROR] Unexpected error:", error.message);

    // TODO: Log this unexpected error into Firestore for further analysis
    // Example:
    // await logErrorToFirestore("UnexpectedError", "Unhandled error occurred", { 
    //   error: error.message 
    // });

    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "An unexpected error occurred. Please try again later.",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}