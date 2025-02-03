import { NextResponse } from "next/server";
import { validateAspApiKey, saveAspConversionData } from "../../../../utils/postbackUtils";

/**
 * POST /api/v1/postback/cv
 * 
 * This API endpoint handles conversion postbacks from external ASPs (e.g., A8.net).
 * 
 * Key Responsibilities:
 * - Validates API key authentication.
 * - Ensures all required fields are present in the request body.
 * - Checks for duplicate conversions using `click_id`.
 * - Saves conversion data to Firestore.
 * 
 * Expected Request:
 * - Headers: `x-api-key: {API_KEY}`
 * - Body: JSON containing conversion details (click_id, conversion_id, source, event_name, etc.)
 * 
 * @param {Request} req - Incoming HTTP request object.
 * @returns {Response} - JSON response indicating success or failure.
 */
export async function POST(req: Request) {
  try {
    // Extract API key from the header
    const apiKey = req.headers.get("x-api-key");

    // Validate API key
    if (!apiKey || !(await validateAspApiKey(apiKey))) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    // Validate required parameters
    const requiredFields = [
      "click_id", "conversion_id", "source", "event_name",
      "event_value", "currency", "campaign_id", "affiliate_id", "timestamp"
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required parameter: ${field}` },
          { status: 400 }
        );
      }
    }

    // Save conversion data to Firestore
    const conversionId = await saveAspConversionData(body);

    return NextResponse.json(
      { success: "Conversion recorded successfully", conversion_id: conversionId },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing conversion postback:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}