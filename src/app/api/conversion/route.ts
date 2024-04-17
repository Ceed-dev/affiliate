import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const referral = request.nextUrl.searchParams.get("referral") as string;

    if (!referral) {
      return NextResponse.json(
        { error: "Referral ID is missing" },
        { status: 400 }
      );
    }

    // ここでコンバージョンを確認し、成功した場合は適切な処理を行う

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
