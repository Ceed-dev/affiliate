import { NextResponse } from "next/server";

/**
 * Handles postback requests to an external webhook via a proxy server.
 * This API validates the request, appends query parameters, and forwards it to the designated webhook.
 */
export async function POST(req: Request) {
  try {
    console.log("📥 [INFO] Received postback request");

    // Step 1: Validate API Key
    const internalApiKey = req.headers.get("x-internal-api-key");
    if (!internalApiKey || internalApiKey !== process.env.INTERNAL_API_KEY) {
      console.warn("🟠 [WARNING] Unauthorized request - Invalid API Key");
      return NextResponse.json({ error: "Forbidden: Invalid API Key" }, { status: 403 });
    }

    // Step 2: Parse request body
    const body = await req.json();
    const { postbackUrl, params } = body;
    
    if (!postbackUrl || !params) {
      console.warn("🟠 [WARNING] Invalid request - Missing postbackUrl or params");
      return NextResponse.json({ error: "Missing postbackUrl or params" }, { status: 400 });
    }

    // Step 3: Retrieve Webhook Proxy Server URL from environment variables
    const webhookProxyUrl = process.env.HEROKU_WEBHOOK_URL;
    if (!webhookProxyUrl) {
      console.error("❌ [ERROR] Missing environment variable: HEROKU_WEBHOOK_URL");
      throw new Error("HEROKU_WEBHOOK_URL is not set in environment variables");
    }

    // Construct the final URL with query parameters
    const fullUrl = `${postbackUrl}?${new URLSearchParams(params).toString()}`;
    console.log("📡 [INFO] Forwarding postback to:", fullUrl);

    // Step 4: Send request to webhook proxy server
    const response = await fetch(webhookProxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.WEBHOOK_API_KEY as string, // 🔐 API Authentication
      },
      body: JSON.stringify({ fullUrl }),
    });

    if (!response.ok) {
      throw new Error(`Postback failed with status ${response.status}`);
    }

    console.log("✅ [SUCCESS] Postback successfully sent to:", postbackUrl);
    return NextResponse.json({ message: "Postback sent successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("❌ [ERROR] Postback request failed", error.message);
    return NextResponse.json(
      { error: "Postback failed", details: error.message },
      { status: 500 }
    );
  }
}