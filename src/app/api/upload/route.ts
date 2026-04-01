import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { saveModel } from "@/lib/db";
import { nanoid } from "nanoid";
import path from "path";

const ALLOWED_EXT = new Set([
  ".glb", ".gltf", ".obj", ".mtl", ".stl", ".usdz", ".fbx",
  ".ply", ".dae", ".3ds", ".3mf", ".blend", ".abc", ".zip",
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const ext = path.extname(pathname).toLowerCase();
        if (!ALLOWED_EXT.has(ext)) {
          throw new Error(`지원하지 않는 형식: ${ext}`);
        }
        return {
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const id = (tokenPayload as string | null) ?? nanoid(10);
        const ext = path.extname(blob.pathname).toLowerCase();
        await saveModel({
          id,
          name: blob.pathname,
          url: blob.url,
          size: 0,
          ext,
          createdAt: new Date().toISOString(),
          views: 0,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload]", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
