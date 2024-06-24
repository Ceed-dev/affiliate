import { NextRequest, NextResponse } from "next/server";
import { incrementClickCount } from "../../utils/firebase";

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

    // Record click information in Firestore
    try {
      await incrementClickCount(referral);
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
