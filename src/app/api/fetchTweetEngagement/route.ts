import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_X_API_BEARER_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get Tweet ID
    const tweetIds = request.nextUrl.searchParams.get("tweetIds");
    if (!tweetIds) {
      return NextResponse.json(
        { error: "Tweet IDs are required" },
        { status: 400 }
      );
    }

    // Create a URL to call the X API endpoint
    // Ref: https://developer.x.com/en/docs/x-api/tweets/lookup/api-reference/get-tweets
    const url = `https://api.x.com/2/tweets?ids=${tweetIds}&tweet.fields=public_metrics`;

    // Get X API key from environment variable
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tweet engagement data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return Results
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching tweet engagement data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tweet engagement data" },
      { status: 500 }
    );
  }
}
