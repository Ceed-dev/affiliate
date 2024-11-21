import { NextRequest, NextResponse } from "next/server";
import { fetchProjects } from "../../../utils/projectUtils";
import { 
  fetchReferralData,
  validateApiKey,
  logConversion,
  fetchConversionLogsForReferrals,
} from "../../../utils/firebase";
import { conversionRequestSchema, applySecurityHeaders, checkRateLimit } from "../../../utils/validationUtils";

export async function POST(request: NextRequest) {
  try {
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
      applySecurityHeaders(response);
      return response;
    }

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

    const { referralId, conversionId, revenue, userWalletAddress } = validationResult.data;

    const referralData = await fetchReferralData(referralId);
    if (!referralData) {
      const response = NextResponse.json(
        {
          error: {
            code: "REFERRAL_NOT_FOUND",
            message: "The specified referral ID does not exist.",
            details: {
              referralId
            }
          }
        },
        { status: 404 }
      );
      applySecurityHeaders(response);
      return response;
    }

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

    if (!checkRateLimit(apiKey)) {
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

    const projectDataArray = await fetchProjects({ projectId: referralData.projectId });
    if (!projectDataArray || projectDataArray.length === 0) {
      const response = NextResponse.json(
        {
          error: {
            code: "PROJECT_NOT_FOUND",
            message: "The specified project does not exist.",
            details: {
              projectId: referralData.projectId
            }
          }
        },
        { status: 404 }
      );
      applySecurityHeaders(response);
      return response;
    }
    const projectData = projectDataArray[0];

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

    await logConversion(
      `${referralData.id}`,
      conversionId,
      rewardAmount,
      validatedUserWalletAddress
    );

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