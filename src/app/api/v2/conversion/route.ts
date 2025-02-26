import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, getDoc, collection, runTransaction, Timestamp, increment } from "firebase/firestore";
import { validateApiKey } from "../../../utils/firebase";

/**
 * Conversion API (v2)
 * Handles conversion tracking based on trackingId and conversionId
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📥 [INFO] Received conversion request");

    // Step 1: Extract and validate API Key
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 400 });
    }

    // Step 2: Parse request body
    const { trackingId, conversionId } = await request.json();
    if (!trackingId || !conversionId) {
      return NextResponse.json({ error: "Tracking ID and Conversion ID are required" }, { status: 400 });
    }

    // Step 3: Retrieve Tracking Data
    const trackingRef = doc(db, "trackingIds", trackingId);
    const trackingSnap = await getDoc(trackingRef);
    if (!trackingSnap.exists()) {
      return NextResponse.json({ error: "Tracking ID not found" }, { status: 404 });
    }
    const trackingData = trackingSnap.data();

    // Step 4: Validate API Key with the Campaign
    const isValidApiKey = await validateApiKey(trackingData.ids.campaignId, apiKey);
    if (!isValidApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    }

    // Step 5: Validate conversionId exists in the project
    const projectRef = doc(db, "projects", trackingData.ids.campaignId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectSnap.data();
    const conversionPoints = projectData.conversionPoints || [];
    const conversionPoint = conversionPoints.find((point: any) => point.id === conversionId);

    if (!conversionPoint) {
      return NextResponse.json({ error: "Conversion point not found" }, { status: 404 });
    }

    // Step 6: Check if the conversion point is active
    if (!conversionPoint.isActive) {
      return NextResponse.json({ message: "Conversion point is inactive" }, { status: 200 });
    }

    // Step 7: Prepare reward details
    const rewardDetails = {
      type: projectData.isUsingXpReward ? "xp" : "token",
      amount: conversionPoint.rewardAmount,
      unit: projectData.isUsingXpReward ? "XP" : projectData.selectedToken.symbol,
      tokenAddress: projectData.isUsingXpReward ? null : projectData.selectedToken.address ?? null,
      chainId: projectData.isUsingXpReward ? null : projectData.selectedToken.chainId ?? null,
      metadata: null, // Reserved for future use
    };

    let clickLogData: any = null;

    try {
      await runTransaction(db, async (transaction) => {
        // --- Fetch existing user or ASP document for transaction ---
        const userOrAspCollection = trackingData.type === "ASP" ? "asps" : "users";
        const userOrAspRef = doc(db, userOrAspCollection, trackingData.ids.affiliatorId);

        // Retrieve user or ASP data from Firestore (ensuring we have `firstConversionAt`)
        const userOrAspSnap = await transaction.get(userOrAspRef);
        const userOrAspData = userOrAspSnap.exists() ? userOrAspSnap.data() : null;

        // Compute firstConversionAt for user/ASP (if not already set)
        const userFirstConversionAt = userOrAspData?.aggregatedStats?.conversionStats?.timestamps?.firstConversionAt ?? Timestamp.now();

        const campaignLinksCollection =
          trackingData.type === "ASP" ? "aspCampaignLinks" : "individualCampaignLinks";

        const clickLogRef = doc(db, `${campaignLinksCollection}/${trackingData.ids.linkId}/clickLogs/${trackingData.ids.clickLogId}`);
        const clickLogSnap = await transaction.get(clickLogRef);

        if (!clickLogSnap.exists()) {
          throw new Error("Click log not found");
        }

        clickLogData = clickLogSnap.data();
        const country = clickLogData.location?.country || null;

        // Step 8: Log Conversion in Conversion Logs
        const conversionLogRef = doc(collection(db, `${campaignLinksCollection}/${trackingData.ids.linkId}/conversionLogs`));
        transaction.set(conversionLogRef, {
          ids: { trackingId, conversionId, clickLogId: trackingData.ids.clickLogId },
          rewardDetails,
          country,
          timestamps: { createdAt: Timestamp.now(), paidAt: null },
          isPaid: false,
        });

        transaction.update(clickLogRef, { "ids.conversionLogId": conversionLogRef.id });

        // Step 9: Update Conversion Statistics
        const campaignRef = doc(db, campaignLinksCollection, trackingData.ids.linkId);
        const currentDate = new Date();
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dd = String(currentDate.getDate()).padStart(2, "0");

        const rewardKey = rewardDetails.type === "xp"
          ? "XP"
          : `${rewardDetails.chainId}-${rewardDetails.tokenAddress}-${rewardDetails.unit}`;

        transaction.update(campaignRef, {
          [`conversionStats.total`]: increment(1),
          [`conversionStats.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
          [`conversionStats.byMonth.${yyyy}-${mm}`]: increment(1),
          [`conversionStats.byConversionPoint.${conversionId}`]: increment(1),
          ...(country && { [`conversionStats.byCountry.${country}`]: increment(1) }),

          [`rewardStats.byRewardUnit.${rewardKey}.unpaidAmount`]: increment(rewardDetails.amount),
          [`rewardStats.byRewardUnit.${rewardKey}.totalAmount`]: increment(rewardDetails.amount),
          [`rewardStats.isPaid.unpaidCount`]: increment(1),

          [`timestamps.updatedAt`]: Timestamp.now(),
        });

        // --- Aggregate conversion stats into the project's document ---
        const projectRef = doc(db, "projects", trackingData.ids.campaignId);

        // Determine the correct aggregation path (ASP or INDIVIDUAL)
        const conversionPath = `aggregatedStats.${trackingData.type}.conversionStats`;
        const rewardPath = `aggregatedStats.${trackingData.type}.rewardStats`;

        transaction.update(projectRef, {
          [`${conversionPath}.total`]: increment(1),
          [`${conversionPath}.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
          [`${conversionPath}.byMonth.${yyyy}-${mm}`]: increment(1),
          [`${conversionPath}.byConversionPoint.${conversionId}`]: increment(1),
          ...(country && { [`${conversionPath}.byCountry.${country}`]: increment(1) }),
          [`${conversionPath}.timestamps.lastConversionAt`]: Timestamp.now(),
          [`${conversionPath}.timestamps.firstConversionAt`]: 
            projectData?.aggregatedStats?.[trackingData.type]?.conversionStats?.timestamps?.firstConversionAt ?? Timestamp.now(),

          [`${rewardPath}.byRewardUnit.${rewardKey}.unpaidAmount`]: increment(rewardDetails.amount),
          [`${rewardPath}.byRewardUnit.${rewardKey}.totalAmount`]: increment(rewardDetails.amount),
          [`${rewardPath}.isPaid.unpaidCount`]: increment(1),
        });

        // --- Aggregate conversion stats into the user's or ASP's document ---
        // Dynamically determine aggregation path
        const userConversionPath = `aggregatedStats.conversionStats`;
        const userRewardPath = `aggregatedStats.rewardStats`;

        transaction.update(userOrAspRef, {
        [`${userConversionPath}.total`]: increment(1),
        [`${userConversionPath}.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
        [`${userConversionPath}.byMonth.${yyyy}-${mm}`]: increment(1),
        [`${userConversionPath}.byConversionPoint.${conversionId}`]: increment(1),
        ...(country && { [`${userConversionPath}.byCountry.${country}`]: increment(1) }),
        [`${userConversionPath}.timestamps.lastConversionAt`]: Timestamp.now(),
        [`${userConversionPath}.timestamps.firstConversionAt`]: userFirstConversionAt,

        [`${userRewardPath}.byRewardUnit.${rewardKey}.unpaidAmount`]: increment(rewardDetails.amount),
        [`${userRewardPath}.byRewardUnit.${rewardKey}.totalAmount`]: increment(rewardDetails.amount),
        [`${userRewardPath}.isPaid.unpaidCount`]: increment(1),
        });

        transaction.delete(trackingRef);

        console.log("✅ [SUCCESS] Conversion recorded and trackingId deleted");
      });

      // Step 10: Handle ASP Postback if applicable
      if (trackingData.type === "ASP") {
        try {
          console.log("📡 [INFO] Preparing postback request for ASP...");
          const aspRef = doc(db, "asps", trackingData.ids.affiliatorId);
          const aspSnap = await getDoc(aspRef);

          if (!aspSnap.exists()) {
            throw new Error("ASP data not found");
          }

          const aspData = aspSnap.data();
          const env = aspData.env;
          const postbackUrls = aspData.postbackUrls;
          const postbackUrl = postbackUrls?.[env] || null;

          if (!postbackUrl) {
            throw new Error(`No postback URL found for env: ${env}`);
          }

          const paramMappings = aspData.paramMappings || [];
          const postbackParams: Record<string, string> = {};

          paramMappings.forEach((mapping: any) => {
            if (mapping.outboundName) {
              postbackParams[mapping.outboundName] =
                mapping.defaultValue ?? clickLogData.params?.[mapping.inboundName] ?? "";
            }
          });

          console.log("📡 [INFO] Sending postback to:", postbackUrl);
          console.log("🔍 [DEBUG] Postback Parameters:", postbackParams);

          // Use NEXT_PUBLIC_BASE_URL for an absolute path
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; 
          const postbackEndpoint = `${baseUrl}/api/postback`;

          const response = await axios.post(postbackEndpoint, 
            { postbackUrl, params: postbackParams },
            {
              headers: {
                "Content-Type": "application/json",
                "x-internal-api-key": process.env.INTERNAL_API_KEY as string,
              },
            }
          );

          console.log("✅ [SUCCESS] Postback response:", response.data);
        } catch (error: any) {
          console.error("❌ [ERROR] Postback preparation failed:", error.message);
        }
      }

      return NextResponse.json({ message: "Conversion recorded successfully" }, { status: 200 });

    } catch (error: any) {
      console.error("❌ [ERROR] Transaction failed", error.message);
      return NextResponse.json({ error: "Transaction failed", details: error.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ [ERROR] Unexpected error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}