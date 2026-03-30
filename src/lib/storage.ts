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

/**
 * 파일명을 안전한 형식으로 정규화 (특수문자 제거)
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w.-]/g, "_") // 특수문자를 언더스코어로 변환
    .replace(/_+/g, "_") // 연속된 언더스코어 제거
    .toLowerCase();
}

export async function storeFile(
  buffer: Buffer,
  filename: string,
  id: string
): Promise<StorageResult> {
  const ext = path.extname(filename).toLowerCase();

  // Vercel Blob (배포 환경)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    // 경로 형식: 슬래시 제거 (Vercel Blob 제약 우회)
    const blob = await put(`${id}${ext}`, buffer, {
      access: "public",
      contentType: getMimeType(ext),
    });
    return { url: blob.url, size: buffer.length };
  }

  // 로컬 파일시스템 (개발 환경)
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${id}${ext}`);
  await writeFile(filePath, buffer);
  return { url: `/uploads/${id}${ext}`, size: buffer.length };
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".obj": "text/plain",
    ".mtl": "text/plain",
    ".stl": "application/octet-stream",
    ".ply": "application/octet-stream",
    ".usdz": "model/vnd.usdz+zip",
    ".fbx": "application/octet-stream",
    ".zip": "application/zip",
    ".dae": "model/vnd.collada+xml",
    ".3ds": "application/octet-stream",
    ".3mf": "model/3mf+xml",
    ".blend": "application/octet-stream",
    ".abc": "application/octet-stream",
  };
  return map[ext] ?? "application/octet-stream";
}
