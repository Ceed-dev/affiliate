import { NextRequest, NextResponse } from "next/server";
import { getXApiClient } from "../../../utils/xApiUtils";

/**
 * Handle GET request to fetch user information from the X API.
 * This function uses the X API client instance to fetch user data, including profile image, metrics, etc.
 * 
 * @param {NextRequest} request - The incoming request containing the token object.
 * @returns {NextResponse} - The JSON response containing the user data or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token object from request body or query (for example)
    const tokenData = request.nextUrl.searchParams.get("tokenData") 
      ? JSON.parse(request.nextUrl.searchParams.get("tokenData") as string) 
      : null;

    if (!tokenData || !tokenData.access_token) {
      return NextResponse.json({ error: "Missing token data" }, { status: 401 });
    }

    // Initialize the X API client with the tokenData
    const client = await getXApiClient(tokenData); // Pass the full token object to getXApiClient

    // Fetch user data with additional fields like profile_image_url, public_metrics, and description
    const userResponse = await client.users.findMyUser({
      "user.fields": [
        "id",
        "name",
        "username",
        "profile_image_url",
        "created_at",
        "description",
        "location",
        "verified",
        "public_metrics"
      ], // Use array format for user fields
    });

    // Return the extended user data in the response
    return NextResponse.json({ user: userResponse.data });
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error fetching user data from X API:", error);

    // Return a 500 response with the error message
    return NextResponse.json({ error: "Failed to fetch user data", details: error.message }, { status: 500 });
  }
}