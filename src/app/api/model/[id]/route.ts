import { NextRequest, NextResponse } from "next/server";
import { getModel, incrementViews } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const model = await getModel(id);

  if (!model) {
    return NextResponse.json({ error: "모델을 찾을 수 없습니다" }, { status: 404 });
  }

  await incrementViews(id);
  return NextResponse.json(model);
}
