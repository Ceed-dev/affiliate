import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "../../../utils/googleApiUtils";

/**
 * Handles the GET request to generate a Google OAuth2.0 authorization URL.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Get the Google OAuth2.0 client instance
    const oauth2Client = await getGoogleOAuth2Client();

    // Step 3: Generate the Google OAuth2.0 authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Request offline access to get refresh tokens
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly", // Scope to access YouTube read-only data
      ],
    });

    // Step 4: Return the authorization URL in the response
    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating Google OAuth2 URL:", error);
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 });
  }
}