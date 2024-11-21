import { NextRequest, NextResponse } from "next/server";
import { fetchProjects } from "../../../utils/projectUtils";
import { 
  fetchReferralData,
  validateApiKey,
  logConversion,
  fetchConversionLogsForReferrals,
} from "../../../utils/firebase";
import { conversionRequestSchema } from "../../../utils/validationUtils";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_API_KEY",
            message: "API key is missing.",
            details: {}
          }
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validationResult = conversionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "The request body is invalid.",
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { referralId, conversionId, revenue, userWalletAddress } = validationResult.data;

    const referralData = await fetchReferralData(referralId);
    if (!referralData) {
      return NextResponse.json(
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
    }

    const isValidApiKey = await validateApiKey(referralData.projectId, apiKey);
    if (!isValidApiKey) {
      return NextResponse.json(
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
    }

    const projectDataArray = await fetchProjects({ projectId: referralData.projectId });
    if (!projectDataArray || projectDataArray.length === 0) {
      return NextResponse.json(
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
    }
    const projectData = projectDataArray[0];

    const conversionPoint = projectData.conversionPoints.find(
      (point) => point.id === conversionId
    );
    if (!conversionPoint) {
      return NextResponse.json(
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
    }

    if (!conversionPoint.isActive) {
      return NextResponse.json(
        {
          message: "The specified conversion point is inactive.",
          details: {
            conversionId
          }
        },
        { status: 200 }
      );
    }

    let rewardAmount = 0;
    if (conversionPoint.paymentType === "FixedAmount") {
      rewardAmount = conversionPoint.rewardAmount || 0;
    } else if (conversionPoint.paymentType === "RevenueShare") {
      if (!revenue) {
        return NextResponse.json(
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
        return NextResponse.json(
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
      }
      rewardAmount = appropriateTier.rewardAmount;
    }

    let validatedUserWalletAddress;

    if (projectData.isReferralEnabled) {
      // Referral is enabled: userWalletAddress must be provided and valid
      if (!userWalletAddress) {
        return NextResponse.json(
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

    return NextResponse.json(
      {
        message: "Conversion successfully recorded.",
        referralId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing conversion:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
          details: {}
        }
      },
      { status: 500 }
    );
  }
}