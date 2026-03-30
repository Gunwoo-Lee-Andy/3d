import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import path from "path";
import { saveModel } from "@/lib/db";

/**
 * POST /api/save-model
 * 클라이언트에서 직접 Vercel Blob에 업로드한 파일의 메타데이터를 DB에 저장
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, fileName, size } = body;

    if (!url || !fileName) {
      return NextResponse.json(
        { error: "URL과 파일명 필수" },
        { status: 400 }
      );
    }

    const ext = path.extname(fileName).toLowerCase();
    const id = nanoid(10);

    await saveModel({
      id,
      name: fileName,
      url,
      size,
      ext,
      createdAt: new Date().toISOString(),
      views: 0,
    });

    return NextResponse.json({
      id,
      url,
      shareUrl: `/view/${id}`,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[save-model]", errorMessage);
    return NextResponse.json(
      {
        error: "메타데이터 저장 실패",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
