import { NextRequest, NextResponse } from "next/server";
import { fetchProjectData, fetchReferralData } from "../../utils/firebase";
import { 
  initializeSigner,
  connectEscrowContract,
  withdrawFromEscrow
} from "../../utils/escrow";

export async function POST(request: NextRequest) {
  try {
    const referral = request.nextUrl.searchParams.get("referral") as string;

    if (!referral) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }
      );
    }

    // リファラルデータを取得
    const referralData = await fetchReferralData(referral);

    if (!referralData) {
      return NextResponse.json(
        { error: "Referral data not found" },
        { status: 404 }
      );
    }

    // プロジェクトデータを取得
    const projectData = await fetchProjectData(referralData.projectId);

    if (!projectData) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }
      );
    }

    // サイナーを初期化
    const signer = initializeSigner(
      `${process.env.PROVIDER_URL}`,
      `${process.env.WALLET_PRIVATE_KEY}`
    );

    // エスクローコントラクトに接続
    const escrowContract = connectEscrowContract(
      `${process.env.ESCROW_CONTRACT_ADDRESS}`,
      signer
    );

    // エスクローから引き出す
    const txhash = await withdrawFromEscrow(
      escrowContract,
      projectData.selectedToken,
      projectData.rewardAmount,
      projectData.ownerAddress,
      referralData.affiliateWallet
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
