import JSZip from "jszip";

export interface ZipModelContent {
  objFile: File;
  mtlFile?: File;
  textureFiles: Map<string, File>;
  mtlContent?: string;
}

/**
 * ZIP 파일에서 OBJ+MTL+텍스처 추출
 */
export async function extractZipModel(
  zipFile: File
): Promise<ZipModelContent> {
  const zip = new JSZip();
  const content = await zip.loadAsync(zipFile);

  const files = Object.values(content.files).filter((f) => !f.dir);

  // OBJ 파일 찾기
  const objEntry = files.find((f) =>
    f.name.toLowerCase().endsWith(".obj")
  );
  if (!objEntry) {
    throw new Error("ZIP에 .obj 파일이 없습니다");
  }

  // MTL 파일 찾기
  const mtlEntry = files.find((f) =>
    f.name.toLowerCase().endsWith(".mtl")
  );

  // 텍스처 파일 찾기
  const textureExts = [
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".gif",
    ".tga",
    ".exr",
  ];
  const textureFiles = new Map<string, File>();

  // OBJ 파일을 File 객체로 변환
  const objBlob = await objEntry.async("blob");
  const objFile = new File([objBlob], objEntry.name, { type: "text/plain" });

  // MTL 파일 처리
  let mtlFile: File | undefined;
  let mtlContent: string | undefined;

  if (mtlEntry) {
    const mtlBlob = await mtlEntry.async("blob");
    mtlFile = new File([mtlBlob], mtlEntry.name, { type: "text/plain" });
    mtlContent = await mtlEntry.async("text");
  }

  // 텍스처 파일 수집
  for (const file of files) {
    const lower = file.name.toLowerCase();
    if (
      textureExts.some((ext) => lower.endsWith(ext)) &&
      !lower.endsWith(".mtl") &&
      !lower.endsWith(".obj")
    ) {
      const blob = await file.async("blob");
      const filename = file.name.split("/").pop() || file.name;
      textureFiles.set(
        filename,
        new File([blob], filename, { type: blob.type })
      );
    }
  }

  return {
    objFile,
    mtlFile,
    textureFiles,
    mtlContent,
  };
}

/**
 * MTL 파일에서 텍스처 참조 추출
 */
export function extractTextureReferencesFromMTL(mtlContent: string): string[] {
  const textureRefs: string[] = [];
  const lines = mtlContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    // MTL의 텍스처 참조: map_Kd, map_Ks, bump 등
    if (
      trimmed.startsWith("map_Kd ") ||
      trimmed.startsWith("map_Ks ") ||
      trimmed.startsWith("map_Ka ") ||
      trimmed.startsWith("bump ") ||
      trimmed.startsWith("disp ")
    ) {
      const parts = trimmed.split(/\s+/);
      if (parts.length > 1) {
        // 파일명만 추출 (경로는 무시)
        const filename = parts[parts.length - 1];
        if (filename) {
          textureRefs.push(filename);
        }
      }
    }
  }

  return textureRefs;
}

/**
 * MTL 파일의 텍스처 경로를 재매핑
 */
export function remapMTLTexturePaths(
  mtlContent: string,
  blobUrlMap: Map<string, string>
): string {
  let remapped = mtlContent;

  for (const [filename, blobUrl] of blobUrlMap.entries()) {
    // MTL에서 모든 경로 참조를 Blob URL로 교체
    // 예: map_Kd texture.jpg → map_Kd blob:http://...
    const regex = new RegExp(`(\\s)(${filename})(?=\\s|$)`, "gi");
    remapped = remapped.replace(regex, `$1${blobUrl}`);
  }

  return remapped;
}
