import { NextRequest, NextResponse } from "next/server";

/**
 * Handles GET requests to fetch engagement data for specific tweets using the X API.
 * 
 * @param {NextRequest} request - The incoming request object containing headers and query parameters.
 * @returns {Promise<NextResponse>} - A promise that resolves to the engagement data for the requested tweet IDs.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_X_API_BEARER_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }  // Unauthorized - Invalid or missing API key
      );
    }

    // Step 2: Get tweet IDs from query parameters
    const tweetIds = request.nextUrl.searchParams.get("tweetIds");
    if (!tweetIds) {
      return NextResponse.json(
        { error: "Tweet IDs are required" },
        { status: 400 }  // Bad Request - Missing required parameter
      );
    }

    // Step 3: Construct the URL for the X API request
    const url = `https://api.x.com/2/tweets?ids=${tweetIds}&tweet.fields=public_metrics`;

    // Step 4: Fetch tweet engagement data from X API using the provided API key
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Step 5: Handle API response errors
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tweet engagement data" },
        { status: response.status }  // Use the status code from the X API response
      );
    }

    // Step 6: Parse the response JSON and return the engagement data
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });  // Success - Return fetched tweet data

  } catch (error) {
    // Step 7: Handle unexpected errors and return a 500 status code
    console.error("Error fetching tweet engagement data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tweet engagement data" },
      { status: 500 }  // Internal Server Error - Unexpected error
    );
  }
}
