import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import path from "path";
import { storeFile } from "@/lib/storage";
import { saveModel } from "@/lib/db";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXT = new Set([".glb", ".gltf", ".obj", ".stl", ".usdz", ".fbx"]);

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
      return NextResponse.json({ error: "파일 크기 100MB 초과" }, { status: 400 });
    }

    const id = nanoid(10);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, size } = await storeFile(buffer, file.name, id);

    await saveModel({
      id,
      name: file.name,
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
