import { NextRequest, NextResponse } from "next/server";
import { fetchProjectData, fetchReferralData } from "../../utils/firebase";

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

    // 成功した場合はリクエストが正常に処理されたことを返す
    return NextResponse.json(
      { message: `Conversion successful : ${referral}` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error has occured" }, 
      { status: 500 }
    );
  }
}
