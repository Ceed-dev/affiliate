import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, doc, setDoc, getDoc, addDoc, increment, updateDoc } from "firebase/firestore";
import crypto from "crypto";
import { fetchLocationData } from "../../../utils/countryUtils";
import { logErrorToFirestore } from "../../../utils/firebase";
import { Timestamp } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aspCampaignId = searchParams.get("id");

    if (!aspCampaignId) {
      return NextResponse.json({ error: "Missing required 'id' parameter" }, { status: 400 });
    }

    // 1️. Retrieve IP address & User-Agent
    const ipHeader = req.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : req.ip;
    if (!ip) {
      return NextResponse.json({ error: "IP address not found" }, { status: 400 });
    }
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 2️. Fetch location data based on IP
    let locationData;
    try {
      locationData = await fetchLocationData(ip);
      if (!locationData?.country_name) {
        await logErrorToFirestore("GeoLocationError", `(ASP) Country unknown for IP: ${ip}`, {
          locationData,
          aspCampaignId,
        });
      }
    } catch (error: any) {
      await logErrorToFirestore("GeoLocationError", `(ASP) Failed to retrieve location data for IP: ${ip}`, {
        error: error.message,
        aspCampaignId,
      });
    }

    // 3️. Fetch ASP Campaign Data
    const aspCampaignRef = doc(db, "aspCampaignLinks", aspCampaignId);
    const aspCampaignSnap = await getDoc(aspCampaignRef);

    if (!aspCampaignSnap.exists()) {
      return NextResponse.json({ error: "ASP Campaign not found" }, { status: 404 });
    }

    const aspCampaignData = aspCampaignSnap.data();
    const campaignId = aspCampaignData.ids.campaignId;
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID not found in ASP Campaign" }, { status: 400 });
    }

    // 4️. Fetch Project Data
    const projectRef = doc(db, "projects", campaignId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectSnap.data();
    const redirectUrl = projectData.redirectUrl;
    if (!redirectUrl) {
      return NextResponse.json({ error: "Redirect URL not found in Project" }, { status: 400 });
    }

    // 5️. Generate a unique tracking ID
    const trackingId = crypto.randomBytes(6).toString("hex");

    // 6️. Fetch ASP Data (for parameter mappings)
    const aspDocRef = doc(db, "asps", aspCampaignData.ids.aspId);
    const aspDocSnap = await getDoc(aspDocRef);
    if (!aspDocSnap.exists()) {
      return NextResponse.json({ error: "ASP data not found" }, { status: 404 });
    }

    const aspData = aspDocSnap.data();
    const paramMappings = aspData.paramMappings || [];

    // 7️. Extract parameters based on mappings
    const params: Record<string, string | null> = {};
    paramMappings.forEach(({ inboundName, defaultValue }: any) => {
      if (inboundName) {
        params[inboundName] = searchParams.get(inboundName) ?? defaultValue ?? null;
      }
    });

    // 8️. Construct location object (fallback to `null` if missing)
    const location = {
      city: locationData?.city || null,
      country: locationData?.country_name || null,
      ip: ip,
      region: locationData?.region_name || null,
    };

    // 9️. Store Click Data in Firestore (clickLogs)
    const clickLogRef = await addDoc(collection(db, `aspCampaignLinks/${aspCampaignId}/clickLogs`), {
      ids: {
        trackingId,
        conversionLogId: null, // Initially set to `null`
      },
      params,
      location,
      userAgent,
      timestamp: Timestamp.now(),
    });

    // 10. Update click statistics in `aspCampaignLinks`
    const currentDate = new Date();
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");

    const statsUpdates: Record<string, any> = {
      [`clickStats.total`]: increment(1),
      [`clickStats.byDay.${yyyy}-${mm}-${dd}`]: increment(1),
      [`clickStats.byMonth.${yyyy}-${mm}`]: increment(1),
      [`timestamps.updatedAt`]: Timestamp.now(),
    };

    if (location.country) {
      statsUpdates[`clickStats.byCountry.${location.country}`] = increment(1);
    }

    await updateDoc(doc(db, "aspCampaignLinks", aspCampaignId), statsUpdates);

    // 11. Store Tracking ID in Firestore (`trackingIds`)
    await setDoc(doc(db, "trackingIds", trackingId), {
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

    // 1️2. Redirect User to Final Destination
    const url = new URL(redirectUrl);
    url.searchParams.append("trackingId", trackingId);
    const finalRedirectUrl = url.toString();

    return NextResponse.redirect(finalRedirectUrl);
  } catch (error) {
    console.error("Error processing click:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}