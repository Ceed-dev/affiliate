import { NextRequest, NextResponse } from "next/server";
import { getXApiClient } from "../../../utils/xApiUtils";

/**
 * Handles the GET request to retrieve recent tweets for a specific user and referral.
 * Validates the API key, constructs the query for recent tweets, and returns engagement data.
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Retrieve necessary query parameters
    const username = request.nextUrl.searchParams.get("username");
    const referralId = request.nextUrl.searchParams.get("referralId");
    // tweetNewestId is used for the recent search API, which only supports tweets from the past week.
    // If the tweet associated with tweetNewestId is older than one week, an error will occur.
    const tweetNewestId = request.nextUrl.searchParams.get("tweetNewestId"); // Optional

    // Ensure all required parameters are provided
    if (!username || !referralId) {
      return NextResponse.json(
        { error: "Username and Referral ID are required" },
        { status: 400 }
      );
    }

    // Initialize variables to store tweets and pagination tokens
    let allTweets: any[] = [];
    let nextToken: string | null = null;

    // Get the API client using a Bearer token
    const client = await getXApiClient(null, true);

    // Construct the search query to find tweets containing referral links
    // The query searches for tweets from the specified username that include the referralId as part of the tweet text,
    // contain links, and exclude retweets.
    // - `from:${username}`: Filters tweets from the given username.
    // - `${referralId}`: Ensures the tweet contains the referral ID (or a part of it).
    // - `has:links`: Limits results to tweets that include a link.
    // - `-is:retweet`: Excludes retweets from the search results.
    let query = `from:${username} ${referralId} has:links -is:retweet`;

    let response;

    // Step 3: Use pagination to retrieve all relevant tweets
    do {
      try {
        response = await client.tweets.tweetsRecentSearch({
          query,
          "tweet.fields": ["public_metrics", "created_at"], // Include public metrics and created_at field
          max_results: 100, // Limit the number of results per request to 100
          next_token: nextToken || undefined, // Handle pagination if more results exist
          since_id: tweetNewestId || undefined, // Use the newest tweet ID to avoid duplication
        });

        // Add the fetched tweets to the allTweets array if data exists
        if (response.data && Array.isArray(response.data)) {
          allTweets = [...allTweets, ...response.data];
        } else {
          console.error("No valid tweet data found");
        }

        // Update the next token for pagination
        nextToken = response.meta?.next_token || null;
      } catch (error: any) {
        console.log(`Failed to fetch tweets with Bearer token: ${error.message}`);
        break; // Exit loop in case of an error
      }
    } while (nextToken);

    // Step 4: Handle case where no tweets were found
    if (allTweets.length === 0) {
      return NextResponse.json(
        { message: "No tweet data found for the provided username and referral ID" },
        { status: 200 } // Successfully handled but no data was found
      );
    }

    // Step 5: Return the fetched tweet engagement data
    return NextResponse.json(allTweets, { status: 200 });

  } catch (error) {
    console.error("Error fetching tweet engagement data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tweet engagement data" },
      { status: 500 }
    );
  }
}