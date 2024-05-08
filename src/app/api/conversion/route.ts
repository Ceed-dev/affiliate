import { NextRequest, NextResponse } from "next/server";
import { initializeSigner, Escrow } from "../../utils/contracts";
import { 
  fetchProjectData, 
  fetchReferralData,
  processRewardPaymentTransaction
} from "../../utils/firebase";

export async function POST(request: NextRequest) {
  try {
    const referral = request.nextUrl.searchParams.get("referral") as string;
    if (!referral) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }
      );
    }

    const referralData = await fetchReferralData(referral);
    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }
      );
    }

    const projectData = await fetchProjectData(referralData.projectId);
    if (!projectData) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }
      );
    }

    const signer = initializeSigner(`${process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY}`);
    const escrow = new Escrow(signer);
    const txhash = await escrow.withdraw(
      referralData.projectId,
      projectData.rewardAmount,
      referralData.affiliateWallet
    );
    if (!txhash) {
      return NextResponse.json(
        { error: "Fail to withdraw" },
        { status: 500 }
      );
    }

    await processRewardPaymentTransaction(
      referralData.projectId, 
      `${referralData.id}`,
      projectData.rewardAmount,
      txhash
    );

    // 成功した場合はリクエストが正常に処理されたことを返す
    return NextResponse.json(
      { 
        message: "Conversion successful",
        referralId: referral,
        txhash: txhash
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An error has occured" }, 
      { status: 500 }
    );
  }
}
