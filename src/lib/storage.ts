/**
 * storage.ts
 * 로컬(개발): public/uploads/ 에 파일 저장, /uploads/<id>.<ext> URL 반환
 * Vercel(배포): BLOB_READ_WRITE_TOKEN 환경변수가 있으면 @vercel/blob 사용
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface StorageResult {
  url: string;
  size: number;
}

export async function storeFile(
  buffer: Buffer,
  ext: string,
  id: string
): Promise<StorageResult> {
  // 확장자 검증
  const normalizedExt = ext.toLowerCase().startsWith(".")
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;

  // Vercel Blob (배포 환경)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    // 경로 형식: 슬래시 제거 (Vercel Blob 제약 우회)
    const blob = await put(`${id}${normalizedExt}`, buffer, {
      access: "public",
      contentType: getMimeType(normalizedExt),
    });
    return { url: blob.url, size: buffer.length };
  }

  // 로컬 파일시스템 (개발 환경)
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${id}${normalizedExt}`);
  await writeFile(filePath, buffer);
  return { url: `/uploads/${id}${normalizedExt}`, size: buffer.length };
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".obj": "text/plain; charset=utf-8",
    ".mtl": "text/plain; charset=utf-8",
    ".stl": "application/octet-stream",
    ".ply": "application/octet-stream",
    ".usdz": "model/vnd.usdz+zip",
    ".fbx": "application/octet-stream",
    ".zip": "application/zip",
    ".dae": "model/vnd.collada+xml; charset=utf-8",
    ".3ds": "application/octet-stream",
    ".3mf": "model/3mf+xml; charset=utf-8",
    ".blend": "application/octet-stream",
    ".abc": "application/octet-stream",
  };
  return map[ext] ?? "application/octet-stream";
}
