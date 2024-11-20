import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { fetchProjects } from "../../../utils/projectUtils";
import { 
  fetchReferralData,
  validateApiKey,
  logConversion,
  fetchConversionLogsForReferrals,
} from "../../../utils/firebase";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      referralId,
      conversionId,
      revenue,
      userWalletAddress,
    } = body;

    if (!referralId) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }
      );
    }

    if (!conversionId) {
      return NextResponse.json(
        { error: "Conversion ID is missing" },
        { status: 400 }
      );
    }

    const referralData = await fetchReferralData(referralId);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }
      );
    }

    const isValidApiKey = await validateApiKey(referralData.projectId, apiKey);
    if (!isValidApiKey) {
      return NextResponse.json(
        { error: "Invalid API key or access denied" },
        { status: 403 }
      );
    }

    const projectDataArray = await fetchProjects({ projectId: referralData.projectId });
    if (!projectDataArray || projectDataArray.length === 0) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }
      );
    }
    const projectData = projectDataArray[0];

    const conversionPoint = projectData.conversionPoints.find(
      (point) => point.id === conversionId
    );
    if (!conversionPoint) {
      return NextResponse.json(
        { error: "Conversion point not found" },
        { status: 400 }
      );
    }

    if (!conversionPoint.isActive) {
      return NextResponse.json(
        { message: "Conversion point is inactive" },
        { status: 200 }
      );
    }

    let rewardAmount = 0;
    if (conversionPoint.paymentType === "FixedAmount") {
      rewardAmount = conversionPoint.rewardAmount || 0;
    } else if (conversionPoint.paymentType === "RevenueShare") {
      if (!revenue || isNaN(parseFloat(revenue)) || parseFloat(revenue) <= 0) {
        return NextResponse.json(
          { error: "Invalid or missing revenue parameter" },
          { status: 400 }
        );
      }
      const percentage = conversionPoint.percentage || 0;
      rewardAmount = Math.round((parseFloat(revenue) * (percentage / 100)) * 10) / 10;
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
          { error: "No appropriate tier found" },
          { status: 400 }
        );
      }
      rewardAmount = appropriateTier.rewardAmount;
    }

    let validatedUserWalletAddress;
    if (projectData.isReferralEnabled) {
      if (!userWalletAddress || !ethers.utils.isAddress(userWalletAddress)) {
        return NextResponse.json(
          { error: "Invalid or missing user wallet address" },
          { status: 400 }
        );
      }
      validatedUserWalletAddress = userWalletAddress;
    }

    await logConversion(
      `${referralData.id}`,
      conversionId,
      rewardAmount,
      validatedUserWalletAddress
    );

    return NextResponse.json(
      { message: "Conversion successful", referralId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing conversion:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}