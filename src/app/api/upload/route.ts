import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CONTENT_TYPES = [
  "model/gltf-binary",
  "model/gltf+json",
  "text/plain",
  "application/octet-stream",
  "model/vnd.usdz+zip",
  "application/zip",
  "model/vnd.collada+xml",
  "model/3mf+xml",
  "model/3mf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("[upload] 완료:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 400 }
    );
  }
}
