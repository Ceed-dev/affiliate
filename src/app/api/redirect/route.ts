import { NextRequest, NextResponse } from "next/server";
import { fetchProjectData, logClickData } from "../../utils/firebase";
import { fetchLocationData } from "../../utils/geo/fetchLocationData";
import { ClickData, EscrowPaymentProjectData } from "../../types";

export async function GET(request: NextRequest) {
  try {
    const urlParams = request.nextUrl.searchParams;
    const projectId = urlParams.get("projectId");
    const referral = urlParams.get("r");

    if (!projectId || !referral) {
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

    // Fetch the project data from Firestore using the helper function
    const projectData = await fetchProjectData(projectId);
    if (!projectData) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }
      );
    }

    // Check if the project type is EscrowPayment and get the redirectUrl
    if (projectData.projectType === "EscrowPayment") {
      const escrowProjectData = projectData as EscrowPaymentProjectData;
      const finalRedirectUrl = `${escrowProjectData.redirectUrl}?r=${referral}`;
      return NextResponse.redirect(finalRedirectUrl);
    } else {
      return NextResponse.json(
        { error: "Invalid project type for redirect" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An error has occurred" }, 
      { status: 500 }
    );
  }
}
