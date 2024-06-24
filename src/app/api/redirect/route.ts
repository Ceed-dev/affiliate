import { NextRequest, NextResponse } from "next/server";
import { logClickData } from "../../utils/firebase";
import { fetchLocationData } from "../../utils/geo/fetchLocationData";
import { ClickData } from "../../types";

export async function GET(request: NextRequest) {
  try {
    const urlParams = request.nextUrl.searchParams;
    const project = urlParams.get("project");
    const referral = urlParams.get("r");

    if (!project || !referral) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Get the user's IP address
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.ip;

    // Get local information
    let locationData = null;
    if (ip) {
      locationData = await fetchLocationData(ip);
    }

    // Get User-Agent
    const userAgent = request.headers.get("user-agent");

    // Create click data
    const clickData: ClickData = {
      timestamp: new Date(),
      ip: ip || "unknown",
      country: locationData?.country_name || "unknown",
      region: locationData?.region_name || "unknown",
      city: locationData?.city || "unknown",
      userAgent: userAgent || "unknown"
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

    // Redirect to client's site
    const redirectUrl = `${project}?r=${referral}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An error has occurred" }, 
      { status: 500 }
    );
  }
}
