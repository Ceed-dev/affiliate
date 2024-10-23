import { NextRequest, NextResponse } from "next/server";
import { getYouTubeApiClient } from "../../apiUtils";
import { GoogleAuthToken } from "../../../../types/affiliateInfo";

/**
 * Handles the POST request to retrieve video data filtered by description keywords.
 * This function fetches all videos from a given YouTube channel, filters them based on
 * the description containing a specific keyword, and returns the video details along with
 * engagement statistics such as view count and like count.
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Validate the API key from request headers
    const apiKey = request.headers.get("internal-api-key");
    if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Step 2: Parse the request body to get the token data, channelId, and filter keyword
    const { tokenData, channelId, filterKeyword } = await request.json();

    if (!tokenData || !channelId || !filterKeyword) {
      return NextResponse.json({ error: "Token data, channel ID, and filter keyword are required" }, { status: 400 });
    }

    // Step 3: Get the YouTube API client with the provided token
    const youtubeClient = await getYouTubeApiClient(tokenData as GoogleAuthToken);

    let nextPageToken: string | null = null;
    let filteredVideos = [];

    // Step 4: Retrieve all videos for the channel
    do {
      const response: any = await youtubeClient.search.list({
        part: ["snippet"],
        channelId: channelId, // Use the channelId passed from the request
        maxResults: 50,
        pageToken: nextPageToken || "",
        type: ["video"],
      });

      const videos = response.data.items || [];
      nextPageToken = response.data.nextPageToken || null;

      // Step 5: Filter videos by description keyword and retrieve engagement data
      for (const video of videos) {
        const videoId = video.id.videoId;
        const videoDescription = video.snippet?.description || "";

        // Check if the video description contains the filter keyword
        if (videoDescription.includes(filterKeyword)) {
          // Get the video engagement details
          const videoDetails = await youtubeClient.videos.list({
            part: ["statistics"],
            id: [videoId],
          });

          const statistics = videoDetails.data.items?.[0]?.statistics;

          // Collect filtered video info and engagement data
          filteredVideos.push({
            videoId,
            title: video.snippet?.title,
            description: video.snippet?.description,
            publishedAt: video.snippet?.publishedAt,
            thumbnails: video.snippet?.thumbnails,
            statistics: statistics || {}, // View count, like count, etc.
          });
        }
      }
    } while (nextPageToken);

    // Step 6: Return the filtered videos and engagement data
    return NextResponse.json({ filteredVideos }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving YouTube video data:", error);
    return NextResponse.json({ error: "Failed to retrieve video data" }, { status: 500 });
  }
}