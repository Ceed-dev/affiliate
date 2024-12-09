import { NextRequest, NextResponse } from "next/server";
import { getYouTubeApiClient } from "../../apiUtils";

/**
 * Handles the POST request to retrieve YouTube account information.
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Parse the request body to get the token data and userId
    const { access_token, refresh_token, scope, token_type, expiry_date, userId } = await request.json();
    if (!access_token || !userId) {
      return NextResponse.json(
        { error: "Access token and User ID are required" },
        { status: 400 }
      );
    }

    const tokenData = {
      access_token,
      refresh_token,
      scope,
      token_type,
      expiry_date,
    };

    // Step 3: Get the YouTube API client with the provided tokens and userId
    const youtubeClient = await getYouTubeApiClient(userId, tokenData);

    // Step 4: Retrieve YouTube account information (e.g., channel details)
    // The "part" parameter specifies which properties of the channel resource to retrieve.
    // - "snippet": Contains basic information about the channel like title, description, and custom thumbnails.
    // - "contentDetails": Includes information about the channel's content, such as playlists and uploads.
    // - "statistics": Provides stats like view count, subscriber count, and video count.
    // The "mine: true" parameter fetches information for the authenticated user's channel, using the provided OAuth2 token.
    // Note: The returned data reflects the state of the channel at the time of the request. Repeated calls may return updated information if the channel's data changes.
    //
    // Example of the returned data structure:
    // {
    //   "kind": "youtube#channelListResponse",
    //   "etag": "some-etag",
    //   "items": [
    //     {
    //       "kind": "youtube#channel",
    //       "id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    //       "snippet": {
    //         "title": "Google Developers",
    //         "description": "The Google Developers channel",
    //         "customUrl": "googledevelopers",
    //         "publishedAt": "2007-08-23T00:34:43Z",
    //         "thumbnails": {
    //           "default": { "url": "https://example.com/default.jpg" },
    //           "medium": { "url": "https://example.com/medium.jpg" },
    //           "high": { "url": "https://example.com/high.jpg" }
    //         }
    //       },
    //       "contentDetails": {
    //         "relatedPlaylists": {
    //           "uploads": "UU_x5XG1OV2P6uZZ5FSM9Ttw"
    //         }
    //       },
    //       "statistics": {
    //         "viewCount": "12345678",
    //         "subscriberCount": "100000",
    //         "hiddenSubscriberCount": false,
    //         "videoCount": "456"
    //       }
    //     }
    //   ],
    //   "pageInfo": {
    //     "totalResults": 1,
    //     "resultsPerPage": 1
    //   }
    // }
    const response = await youtubeClient.channels.list({
      part: ["snippet", "contentDetails", "statistics"],
      mine: true, // Fetch the authenticated user's channel information
    });

    // Step 5: Return the account information in the response
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error fetching YouTube account information:", error);
    return NextResponse.json({ error: "Failed to fetch YouTube account information" }, { status: 500 });
  }
}