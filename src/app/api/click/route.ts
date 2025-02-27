/**
 * This API endpoint handles both old and new click tracking specifications.
 * - Old specification (no `type`): requires `r` (referralId) and `t` (targetUrl),
 *   then logs a legacy click record and redirects to the target URL.
 * - New specification (`type="asp"` or `type="individual"`): requires `id` (campaignLinkId),
 *   retrieves the relevant campaign documents from Firestore,
 *   saves a click log, updates statistics, generates a trackingId, and redirects to the final URL.
 * 
 * Common steps:
 * 1. Extract IP address and user agent from request headers.
 * 2. Optionally fetch GeoLocation data based on IP (if available).
 * 3. Either handle the old flow (direct referral link) or the new flow (ASP/individual).
 * 4. Perform a Firestore transaction to save/update click logs, stats, and trackingIds.
 * 5. Redirect the user, appending a trackingId to the final destination URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../utils/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  increment,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import crypto from "crypto";
import { fetchLocationData } from "../../utils/countryUtils";
import { logErrorToFirestore, logClickData } from "../../utils/firebase";
import { checkRateLimit } from "../../utils/validationUtils";

/**
 * Retrieves a Firestore document by collection name and doc ID.
 * Throws an error if the document does not exist.
 *
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The document ID to retrieve.
 * @param errorMessage - The error message to throw if the document does not exist.
 * @returns The document data if it exists.
 */
async function getDocumentOrThrow(
  collectionName: string,
  docId: string,
  errorMessage: string
) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(errorMessage);
  }
  return docSnap.data();
}

export async function GET(request: NextRequest) {
  try {
    console.log("📥 [INFO] Received click request");

    // --- 1) Parse query parameters and IP address ---
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "asp" | "individual" | undefined (old spec)
    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : request.ip;
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!ip) {
      return NextResponse.json({ error: "IP address not found" }, { status: 400 });
    }

    // --- 2) Fetch GeoLocation data (optional) ---
    let locationData: any = null;
    try {
      locationData = await fetchLocationData(ip);
    } catch (error: any) {
      console.error("Failed to retrieve location data:", error);
    }

    // --- 3) If type is NOT provided, handle the old spec flow ---
    if (!type) {
      const referralId = searchParams.get("r");
      const targetUrl = searchParams.get("t");

      if (!referralId || !targetUrl) {
        return NextResponse.json(
          { error: "Referral ID and Target URL are required" },
          { status: 400 }
        );
      }

      // Optional rate limit check
      const isRateLimitAllowed = checkRateLimit(`${referralId}-${ip}`, "click");
      if (isRateLimitAllowed) {
        await logClickData(referralId, {
          timestamp: new Date(),
          ip,
          country: locationData?.country_name || "unknown",
          region: locationData?.region_name || "unknown",
          city: locationData?.city || "unknown",
          userAgent,
        });
      }

      // Telegram Mini App check
      const decodedTargetUrl = decodeURIComponent(targetUrl);
      const url = new URL(decodedTargetUrl);

      if (decodedTargetUrl.startsWith("https://t.me/")) {
        url.searchParams.append("startapp", referralId);
      } else {
        url.searchParams.append("r", referralId);
      }

      return NextResponse.redirect(url.toString());
    }

    // --- 4) If type is provided, it must be "asp" or "individual" ---
    if (type !== "asp" && type !== "individual") {
      return NextResponse.json(
        { error: `Invalid type parameter: ${type}` },
        { status: 400 }
      );
    }

    // The new spec requires a campaignLinkId (id)
    const campaignLinkId = searchParams.get("id");
    if (!campaignLinkId) {
      return NextResponse.json(
        { error: "Missing required 'id' parameter" },
        { status: 400 }
      );
    }

    // --- 5) Fetch the link data from Firestore (aspCampaignLinks or individualCampaignLinks) ---
    const colName = type === "asp" ? "aspCampaignLinks" : "individualCampaignLinks";
    let campaignLinkData: any;
    try {
      campaignLinkData = await getDocumentOrThrow(
        colName,
        campaignLinkId,
        `${type} campaign link not found`
      );
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // --- 6) Retrieve the final redirect URL by campaignId from "campaigns" ---
    const { campaignId } = campaignLinkData?.ids || {};
    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID not found in campaign link" },
        { status: 400 }
      );
    }

    let campaignData: any;
    try {
      campaignData = await getDocumentOrThrow("campaigns", campaignId, "Campaign not found");
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const redirectUrl = campaignData.urls.redirect;
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "Redirect URL not found in campaign data" },
        { status: 400 }
      );
    }

    // --- 7) Create a trackingId, optionally handle ASP paramMappings, and run Firestore transaction ---
    const trackingId = crypto.randomBytes(6).toString("hex");
    let params: Record<string, string | null> = {};

    if (type === "asp") {
      // ASP paramMappings
      let aspData: any;
      try {
        aspData = await getDocumentOrThrow(
          "asps",
          campaignLinkData.ids.aspId,
          "ASP data not found"
        );
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      const paramMappings = aspData.paramMappings || [];

      // Determine required inbound parameters
      const requiredParams = paramMappings
        .map(({ inboundName }: any) => inboundName)
        .filter((name: any) => typeof name === "string" && name.trim().length > 0);

      // Check for missing required parameters
      const missingParams = requiredParams.filter(
        (param: any) => !searchParams.get(param)
      );
      if (missingParams.length > 0) {
        return NextResponse.json(
          {
            error: "Missing required parameters",
            message: `The request is missing required parameters: ${missingParams.join(
              ", "
            )}`,
            action: "If this issue persists, please contact support.",
          },
          { status: 400 }
        );
      }

      // Extract actual inbound parameters
      paramMappings.forEach(({ inboundName, defaultValue }: any) => {
        if (typeof inboundName === "string" && inboundName.trim().length > 0) {
          params[inboundName] =
            searchParams.get(inboundName) ?? defaultValue ?? null;
        }
      });
    }

    // Build location object (for click logs)
    const location = {
      city: locationData?.city || null,
      country: locationData?.country_name || null,
      ip,
      region: locationData?.region_name || null,
    };

    try {
      await runTransaction(db, async (transaction) => {
        // --- Fetch existing user or ASP document for transaction ---
        const userOrAspId = type === "asp" ? campaignLinkData.ids.aspId : campaignLinkData.ids.userId;
        const userOrAspCollection = type === "asp" ? "asps" : "users";
        const userOrAspRef = doc(db, userOrAspCollection, userOrAspId);

        // Retrieve user or ASP data from Firestore (ensuring we have `firstClickAt`)
        const userOrAspSnap = await transaction.get(userOrAspRef);
        const userOrAspData = userOrAspSnap.exists() ? userOrAspSnap.data() : null;

        // Compute firstClickAt for user/ASP (if not already set)
        const userFirstClickAt = userOrAspData?.aggregatedStats?.clickStats?.timestamps?.firstClickAt ?? Timestamp.now();

        // Verify campaign link existence within transaction
        const campaignLinkRef = doc(db, colName, campaignLinkId);
        const campaignLinkSnap = await transaction.get(campaignLinkRef);
        if (!campaignLinkSnap.exists()) {
          throw new Error(`${type.toUpperCase()} Campaign Link not found`);
        }

        // Create a click log in the sub-collection
        const clickLogRef = doc(collection(db, `${colName}/${campaignLinkId}/clickLogs`));
        transaction.set(clickLogRef, {
          ids: {
            trackingId,
            conversionLogId: null,
          },
          ...(type === "asp" && { params }),
          location,
          userAgent,
          timestamp: Timestamp.now(),
        });

        // Update click statistics
        const currentDate = new Date();
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dd = String(currentDate.getDate()).padStart(2, "0");

        transaction.update(campaignLinkRef, {
          [`clickStats.total`]: increment(1),
          [`clickStats.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
          [`clickStats.byMonth.${yyyy}-${mm}`]: increment(1),
          [`timestamps.updatedAt`]: Timestamp.now(),
          ...(location.country && {
            [`clickStats.byCountry.${location.country}`]: increment(1),
          }),
        });

        // --- Aggregate click stats into the campaign's document ---
        const campaignRef = doc(db, "campaigns", campaignId);

        // Determine the correct aggregation path (ASP or INDIVIDUAL)
        const aggregationPath = `aggregatedStats.${type.toUpperCase()}.clickStats`;

        // Update click statistics in the campaign's aggregatedStats
        transaction.update(campaignRef, {
          [`${aggregationPath}.total`]: increment(1),
          [`${aggregationPath}.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
          [`${aggregationPath}.byMonth.${yyyy}-${mm}`]: increment(1),
          ...(location.country && {
            [`${aggregationPath}.byCountry.${location.country}`]: increment(1),
          }),
          [`${aggregationPath}.timestamps.lastClickAt`]: Timestamp.now(),
          [`${aggregationPath}.timestamps.firstClickAt`]: campaignData.aggregatedStats?.[type.toUpperCase()]?.clickStats?.timestamps?.firstClickAt ?? Timestamp.now(),
          [`timestamps.updatedAt`]: Timestamp.now(),
        });

        // --- Aggregate click stats into the user's or ASP's document ---
        // Check if `aggregatedStats` exists in the user or ASP document
        if (!userOrAspData?.aggregatedStats) {
          transaction.set(userOrAspRef, {
            aggregatedStats: {
              activeCampaignsCount: 0,
              clickStats: {
                total: 0,
                byCountry: {},
                byDay: {},
                byMonth: {},
                timestamps: { firstClickAt: null, lastClickAt: null },
              },
              conversionStats: {
                total: 0,
                byConversionPoint: {},
                byCountry: {},
                byDay: {},
                byMonth: {},
                timestamps: { firstConversionAt: null, lastConversionAt: null },
              },
              rewardStats: {
                byRewardUnit: {},
                isPaid: { paidCount: 0, unpaidCount: 0 },
                timestamps: { firstPaidAt: null, lastPaidAt: null },
              },
            },
          }, { merge: true });
        }

        // Dynamically determine `aggregationPath`
        const userAggregationPath = `aggregatedStats.clickStats`;

        transaction.update(userOrAspRef, {
          [`${userAggregationPath}.total`]: increment(1),
          [`${userAggregationPath}.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
          [`${userAggregationPath}.byMonth.${yyyy}-${mm}`]: increment(1),
          ...(location.country && {
            [`${userAggregationPath}.byCountry.${location.country}`]: increment(1),
          }),
          [`${userAggregationPath}.timestamps.lastClickAt`]: Timestamp.now(),
          [`${userAggregationPath}.timestamps.firstClickAt`]: userFirstClickAt,
          [type === "asp" ? "timestamps.updatedAt" : "updatedAt"]: Timestamp.now(),
        });

        // Store trackingId in the global "trackingIds" collection
        const trackingRef = doc(db, "trackingIds", trackingId);
        transaction.set(trackingRef, {
          ids: {
            affiliatorId:
              type === "asp"
                ? campaignLinkData.ids.aspId
                : campaignLinkData.ids.userId,
            campaignId: campaignLinkData.ids.campaignId,
            linkId: campaignLinkId,
            clickLogId: clickLogRef.id,
          },
          status: "active",
          timestamps: {
            createdAt: Timestamp.now(),
            expiresAt: null,
          },
          type: type.toUpperCase(),
        });
      });

      console.log("✅ [SUCCESS] Transaction completed successfully");
    } catch (error: any) {
      console.error("❌ [ERROR] Transaction failed", error.message);
      return NextResponse.json(
        { error: "Transaction failed. Please try again.", details: error.message },
        { status: 500 }
      );
    }

    // --- 8) Redirect user with trackingId appended ---
    const url = new URL(redirectUrl);

    if (redirectUrl.startsWith("https://t.me/")) {
      url.searchParams.append("startapp", trackingId);
    } else {
      url.searchParams.append("trackingId", trackingId);
    }

    return NextResponse.redirect(url.toString());
  } catch (error: any) {
    console.error("❌ [ERROR] Unexpected error:", error.message);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}