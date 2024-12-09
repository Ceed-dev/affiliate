import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "../../apiUtils";

/**
 * Handles the GET request to generate a Google OAuth2.0 authorization URL.
 * @param {NextRequest} request - The incoming request object.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Retrieve the userId from the query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Step 3: Get the Google OAuth2.0 client instance with userId
    const oauth2Client = await getGoogleOAuth2Client(userId);

    // Step 4: Generate the Google OAuth2.0 authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Request offline access to get refresh tokens
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly", // Scope to access YouTube read-only data
      ],
    });

    // Step 5: Return the authorization URL in the response
    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating Google OAuth2 URL:", error);
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 });
  }
}