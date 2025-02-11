import { NextRequest, NextResponse } from "next/server";
import { fetchProjects } from "../../../utils/projectUtils";
import { 
  fetchReferralData,
  validateApiKey,
  logConversion,
  fetchConversionLogsForReferrals,
} from "../../../utils/firebase";
import {
  conversionRequestSchema,
  applySecurityHeaders,
  checkRateLimit,
} from "../../../utils/validationUtils";

/**
 * Conversion API - Processing Flow
 * 
 * This API handles conversion logging for referral links. Below is the high-level flow of the API:
 * 
 * 1. **API Key Validation**
 *    - Extract `x-api-key` from the request headers.
 *    - Ensure the API key is provided and valid for the associated project.
 * 
 * 2. **Request Body Validation**
 *    - Parse and validate the request body using a predefined schema.
 *    - Required fields: `referralId`, `conversionId`.
 *    - Optional fields: `revenue` (for RevenueShare), `userWalletAddress` (if referral is enabled).
 * 
 * 3. **Referral Validation**
 *    - Fetch referral data from Firestore using the provided `referralId`.
 *    - Ensure the referral exists and is associated with a valid project.
 * 
 * 4. **Rate Limiting**
 *    - Check the request rate for the provided API key to prevent abuse.
 * 
 * 5. **Project and Conversion Point Validation**
 *    - Fetch project data associated with the referral.
 *    - Ensure the project exists and the specified conversion point (`conversionId`) is valid and active.
 * 
 * 6. **Reward Calculation**
 *    - Determine the reward amount based on the conversion point's payment type:
 *      - `FixedAmount`: Use the predefined reward amount.
 *      - `RevenueShare`: Calculate based on revenue and percentage.
 *      - `Tiered`: Determine the reward from tiers based on conversion count.
 * 
 * 7. **Referral Feature Validation**
 *    - If referral is enabled, validate the `userWalletAddress` field.
 * 
 * 8. **Log Conversion**
 *    - Save the conversion details to Firestore.
 * 
 * 9. **Response**
 *    - Return a success response with a message and the `referralId`.
 * 
 * Error Handling:
 * - Returns appropriate error responses for missing or invalid parameters, rate limits, or internal server issues.
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Retrieve the API key from request headers.
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      const response = NextResponse.json(
        {
          error: {
            code: "MISSING_API_KEY",
            message: "API key is missing.",
            details: {}
          }
        },
        { status: 400 }
      );
      applySecurityHeaders(response); // Add security headers to the response
      return response;
    }

    // Step 2: Parse the request body and validate against the schema.
    const body = await request.json();
    const validationResult = conversionRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const response = NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "The request body is invalid.",
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
      applySecurityHeaders(response);
      return response;
    }

    // Extract validated parameters from the request body.
    const { referralId, conversionId, revenue, userWalletAddress, click_id } = validationResult.data;

    const aspReferralIds = process.env.ASP_REFERRALS?.split(",") || [];
    const isAspReferral = aspReferralIds.includes(referralId);
    if (isAspReferral && !click_id) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_CLICK_ID",
            message: "click_id is required for ASP conversions.",
            details: { referralId }
          }
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch referral data from Firestore using the referral ID.
    let referralData;
    try {
      referralData = await fetchReferralData(referralId);
    } catch (error) {
      const response = NextResponse.json(
        {
          error: {
            code: "REFERRAL_NOT_FOUND",
            message: "The specified referral ID does not exist or data is invalid.",
            details: {
              referralId,
            },
          },
        },
        { status: 404 }
      );
      applySecurityHeaders(response);
      return response;
    }

    // Step 4: Validate the API key against the project associated with the referral.
    const isValidApiKey = await validateApiKey(referralData.projectId, apiKey);
    if (!isValidApiKey) {
      const response = NextResponse.json(
        {
          error: {
            code: "INVALID_API_KEY",
            message: "The provided API key is invalid or access is denied.",
            details: {
              projectId: referralData.projectId
            }
          }
        },
        { status: 403 }
      );
      applySecurityHeaders(response);
      return response;
    }

    // Step 5: Check the request rate limit for the API key.
    if (!checkRateLimit(apiKey, "cv")) {
      const response = NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            details: {
              projectId: referralData.projectId
            }
          },
        },
        { status: 429 }
      );
      applySecurityHeaders(response);
      return response;
    }

    // Step 6: Retrieve project data associated with the referral.
    let projectDataArray;
    try {
      projectDataArray = await fetchProjects({ projectId: referralData.projectId });
    } catch (error: any) {
      const response = NextResponse.json(
        {
          error: {
            code: "PROJECT_FETCH_ERROR",
            message: "Failed to fetch project data.",
            details: {
              projectId: referralData.projectId,
              error: error.message,
            },
          },
        },
        { status: 500 }
      );
      applySecurityHeaders(response);
      return response;
    }

    if (!projectDataArray || projectDataArray.length === 0) {
      const response = NextResponse.json(
        {
          error: {
            code: "PROJECT_NOT_FOUND",
            message: "The specified project does not exist.",
            details: {
              projectId: referralData.projectId,
            },
          },
        },
        { status: 404 }
      );
      applySecurityHeaders(response);
      return response;
    }

    const projectData = projectDataArray[0];

    // Step 7: Find the conversion point using the conversion ID.
    const conversionPoint = projectData.conversionPoints.find(
      (point) => point.id === conversionId
    );
    if (!conversionPoint) {
      const response = NextResponse.json(
        {
          error: {
            code: "CONVERSION_POINT_NOT_FOUND",
            message: "The specified conversion point does not exist.",
            details: {
              conversionId
            }
          }
        },
        { status: 400 }
      );
      applySecurityHeaders(response);
      return response;
    }

    // Step 8: Check if the conversion point is active.
    if (!conversionPoint.isActive) {
      const response = NextResponse.json(
        {
          message: "The specified conversion point is inactive.",
          details: {
            conversionId
          }
        },
        { status: 200 }
      );
      applySecurityHeaders(response);
      return response;
    }

    // Step 9: Calculate the reward amount based on the conversion point type.
    let rewardAmount = 0;
    if (conversionPoint.paymentType === "FixedAmount") {
      rewardAmount = conversionPoint.rewardAmount || 0;
    } else if (conversionPoint.paymentType === "RevenueShare") {
      if (!revenue) {
        const response = NextResponse.json(
          {
            error: {
              code: "INVALID_REVENUE",
              message: "Revenue parameter is required for RevenueShare payment type.",
              details: {
                field: "revenue",
                issue: "Revenue must be provided and should be a positive number."
              }
            }
          },
          { status: 400 }
        );
        applySecurityHeaders(response);
        return response;
      }
      const percentage = conversionPoint.percentage || 0;
      rewardAmount = Math.round((revenue * (percentage / 100)) * 10) / 10;
    } else if (conversionPoint.paymentType === "Tiered") {
      const conversionLogs = await fetchConversionLogsForReferrals(
        [referralData],
        undefined,
        conversionId
      );
      const conversionCount = conversionLogs.length + 1;
      const appropriateTier = conversionPoint.tiers
        ?.reverse()
        .find((tier) => conversionCount >= tier.conversionsRequired);
      if (!appropriateTier) {
        const response = NextResponse.json(
          {
            error: {
              code: "NO_APPROPRIATE_TIER",
              message: "No appropriate tier found for the current conversion count.",
              details: {
                conversionCount
              }
            },
          },
          { status: 400 }
        );
        applySecurityHeaders(response);
        return response;
      }
      rewardAmount = appropriateTier.rewardAmount;
    }

    // Step 10: Validate and set the user wallet address if referral is enabled.
    let validatedUserWalletAddress;
    if (projectData.isReferralEnabled) {
      // Referral is enabled: userWalletAddress must be provided and valid
      if (!userWalletAddress) {
        const response = NextResponse.json(
          {
            error: {
              code: "INVALID_USER_WALLET",
              message: "User wallet address is required when referral is enabled.",
              details: {
                field: "userWalletAddress",
                issue: "A valid wallet address must be provided.",
              },
            },
          },
          { status: 400 }
        );
        applySecurityHeaders(response);
        return response;
      }
      // Set validated address (already guaranteed to be valid by schema)
      validatedUserWalletAddress = userWalletAddress;
    } else {
      // Referral is not enabled: no userWalletAddress required
      validatedUserWalletAddress = undefined; // Or keep it undefined if preferable
    }

    // Step 11: Log the conversion in the database.
    await logConversion(
      `${referralData.id}`,
      conversionId,
      rewardAmount,
      validatedUserWalletAddress
    );

    // Step 12: Send conversion data to Heroku Webhook (which acts as a proxy for ASP)
    if (isAspReferral && click_id) {
      const herokuWebhookUrl = process.env.HEROKU_WEBHOOK_URL;

      if (!herokuWebhookUrl) {
        console.error("Heroku Webhook URL is not configured in environment variables.");
      } else {
        try {
          const herokuResponse = await fetch(herokuWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ click_id }),
          });

          if (!herokuResponse.ok) {
            console.error("Failed to send conversion data to Heroku Webhook:", await herokuResponse.text());
          }
        } catch (error: any) {
          console.error("Error sending conversion data to Heroku Webhook:", error.message);
        }
      }
    }

    // Step 13: Return a success response.
    const response = NextResponse.json(
      {
        message: "Conversion successfully recorded.",
        referralId
      },
      { status: 200 }
    );
    applySecurityHeaders(response);
    return response;
  } catch (error) {
    // Log unexpected errors and return a server error response.
    console.error("Error processing conversion:", error);
    const response = NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
          details: {}
        }
      },
      { status: 500 }
    );
    applySecurityHeaders(response);
    return response;
  }
}