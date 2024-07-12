import { NextRequest, NextResponse } from "next/server";
import { logClickData, validateApiKey, fetchReferralData } from "../../utils/firebase";
import { fetchLocationData } from "../../utils/geo/fetchLocationData";
import { ClickData } from "../../types";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 400 }
      );
    }

    const { referral, ip, userAgent } = await request.json();

    if (!referral || !ip || !userAgent) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const referralData = await fetchReferralData(referral);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }
      );
    }

    const isValidApiKey = await validateApiKey(referralData.projectId, apiKey);
    if (!isValidApiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 }
      );
    }

    // Get local information
    const locationData = await fetchLocationData(ip);

    // Create click data
    const clickData: ClickData = {
      timestamp: new Date(),
      ip: ip,
      country: locationData?.country_name || "unknown",
      region: locationData?.region_name || "unknown",
      city: locationData?.city || "unknown",
      userAgent: userAgent
    };

    // Record click information in Firestore
    try {
      await logClickData(referral, clickData);
    } catch (error) {
      console.error("Failed to log click: ", error);
      return NextResponse.json(
        { error: "Failed to log click" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Click logged successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An error has occurred" }, 
      { status: 500 }
    );
  }
}
