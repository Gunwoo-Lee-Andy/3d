import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import path from "path";
import { storeFile } from "@/lib/storage";
import { saveModel } from "@/lib/db";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_EXT = new Set([
  ".glb", ".gltf", ".obj", ".mtl", ".stl", ".usdz", ".fbx",
  ".ply", ".dae", ".3ds", ".3mf", ".blend", ".abc", ".zip"
]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: `지원하지 않는 형식: ${ext}` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기 500MB 초과" }, { status: 400 });
    }

    const id = nanoid(10);
    const buffer = Buffer.from(await file.arrayBuffer());

    // 파일명 정규화 (특수문자 제거)
    const sanitizedName = file.name
      .replace(/[^\w.-]/g, "_") // 특수문자를 언더스코어로 변환
      .replace(/_+/g, "_") // 연속된 언더스코어 제거
      .toLowerCase();

    const { url, size } = await storeFile(buffer, sanitizedName, id);

    await saveModel({
      id,
      name: sanitizedName,
      url,
      size,
      ext,
      createdAt: new Date().toISOString(),
      views: 0,
    });

    return NextResponse.json({ id, url, shareUrl: `/view/${id}` });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
