import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../utils/xApiUtils";

/**
 * Handles the GET request to retrieve tweet engagement data based on a list of tweet IDs.
 * Validates the API key, processes tweet IDs in batches, and returns the corresponding tweet data.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Get and validate tweetIds
    const tweetIds = request.nextUrl.searchParams.get("tweetIds");
    if (!tweetIds) {
      return NextResponse.json({ error: "Tweet IDs are required" }, { status: 400 });
    }

    // Convert tweet IDs string to an array
    const tweetIdsArray = tweetIds.split(","); 

    // Set the maximum batch size for API requests (100 tweets per batch)
    const batchSize = 100;

    // Initialize an array to hold the fetched tweet data
    const allTweets: any[] = [];

    const client = await getApiClient(null, true); // Bearer token client

    // Step 3: Fetch tweets in batches of 100 to comply with API limits
    for (let i = 0; i < tweetIdsArray.length; i += batchSize) {
      const batchIds = tweetIdsArray.slice(i, i + batchSize); // Get the current batch of tweet IDs

      // Fetch tweet data for the current batch of tweet IDs
      const response = await client.tweets.findTweetsById({
        ids: batchIds,
        "tweet.fields": ["public_metrics"], // Request public metrics for the tweets
      });

      // Append the fetched tweet data to the allTweets array if valid data is received
      if (response.data && Array.isArray(response.data)) {
        allTweets.push(...response.data);
      }
    }

    // Step 4: Handle no tweet data found
    if (allTweets.length === 0) {
      return NextResponse.json({ error: "No tweet data found for the provided tweet IDs" }, { status: 404 });
    }

    // Step 5: Return fetched tweet data
    return NextResponse.json(allTweets, { status: 200 });

  } catch (error) {
    console.error("Error fetching tweet data:", error);
    return NextResponse.json({ error: "An error occurred while fetching tweet data" }, { status: 500 });
  }
}