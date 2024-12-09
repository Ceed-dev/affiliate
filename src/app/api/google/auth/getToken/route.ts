import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "../../apiUtils";

/**
 * Handles the POST request to exchange an authorization code for access and refresh tokens.
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Parse the request body to get the authorization code and userId
    const { code, userId } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Step 3: Get the Google OAuth2.0 client instance with userId
    const oauth2Client = await getGoogleOAuth2Client(userId);

    // Step 4: Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Step 5: Return the tokens in the response
    return NextResponse.json({ tokens }, { status: 200 });
  } catch (error) {
    console.error("Error exchanging authorization code for tokens:", error);
    return NextResponse.json({ error: "Failed to exchange authorization code for tokens" }, { status: 500 });
  }
}