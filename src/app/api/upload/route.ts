import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import path from "path";
import { saveModel } from "@/lib/db";

const ALLOWED_EXT = new Set([
  ".glb", ".gltf", ".obj", ".mtl", ".stl", ".usdz", ".fbx",
  ".ply", ".dae", ".3ds", ".3mf", ".blend", ".abc", ".zip",
]);

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get("filename") ?? "model";

    // 파일명 정규화 (특수문자 제거)
    const sanitizedName = rawName
      .replace(/[^\w.-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();

    const ext = path.extname(sanitizedName).toLowerCase();

    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: `지원하지 않는 형식: ${ext}` }, { status: 400 });
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기 500MB 초과" }, { status: 400 });
    }

    const id = nanoid(10);
    const pathname = `${id}${ext}`;

    // request.body 스트리밍으로 Vercel Blob에 직접 업로드
    const blob = await put(pathname, req.body!, {
      access: "public",
      contentType: req.headers.get("content-type") ?? "application/octet-stream",
    });

    await saveModel({
      id,
      name: sanitizedName,
      url: blob.url,
      size: contentLength,
      ext,
      createdAt: new Date().toISOString(),
      views: 0,
    });

    return NextResponse.json({ id, url: blob.url, shareUrl: `/view/${id}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
