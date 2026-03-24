"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const GLBViewer = dynamic(() => import("./GLBViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 text-sm">
      3D 모델 로딩 중…
    </div>
  ),
});

const ARViewer = dynamic(() => import("./ARViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 text-sm">
      AR 뷰어 로딩 중…
    </div>
  ),
});

const ACCEPTED = [".glb", ".gltf", ".obj", ".stl", ".usdz"];

type UploadState = "idle" | "uploading" | "error";

export default function UploadAndView() {
  const router = useRouter();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [arMode, setArMode] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    // 즉시 로컬 미리보기
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const localUrl = URL.createObjectURL(file);
    setBlobUrl(localUrl);
    setFileName(file.name);
    setUploadState("uploading");
    setUploadError("");

    // 백그라운드 업로드 → 완료 시 /view/:id 로 이동
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "업로드 실패");
      URL.revokeObjectURL(localUrl);
      router.push(data.shareUrl);
    } catch (err) {
      setUploadState("error");
      setUploadError(err instanceof Error ? err.message : "업로드 실패");
    }
  }, [blobUrl, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: fileName, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareMsg("링크 복사됨!");
        setTimeout(() => setShareMsg(""), 2000);
      });
    }
  }, [fileName]);

  const handleReset = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setFileName("");
    setUploadState("idle");
    setUploadError("");
  }, [blobUrl]);

  // ─── Viewer mode (로컬 미리보기 + 업로드 진행 중) ───────────────
  if (blobUrl) {
    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-sm shrink-0">
          <button onClick={handleReset} className="text-zinc-400 hover:text-white transition-colors">
            ← 새 파일
          </button>
          <div className="flex flex-col items-center">
            <span className="text-zinc-300 truncate max-w-[160px] sm:max-w-xs">{fileName}</span>
            {uploadState === "uploading" && (
              <span className="text-xs text-blue-400 animate-pulse">업로드 중…</span>
            )}
            {uploadState === "error" && (
              <span className="text-xs text-red-400">{uploadError}</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setArMode((v) => !v)}
              className={`transition-colors ${arMode ? "text-blue-400" : "text-zinc-400 hover:text-white"}`}
            >
              {arMode ? "3D" : "AR"}
            </button>
            <button onClick={handleShare} className="text-zinc-400 hover:text-white transition-colors">
              {shareMsg || "공유"}
            </button>
            <a href={blobUrl} download={fileName} className="text-zinc-400 hover:text-white transition-colors">
              다운로드
            </a>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 min-h-0">
          {arMode ? <ARViewer url={blobUrl} /> : <GLBViewer url={blobUrl} />}
        </div>
      </div>
    );
  }

  // ─── Upload mode ───────────────────────────────────────────────
  return (
    <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 gap-8">
      <div className="text-center max-w-xl">
        <h2 className="text-4xl font-bold tracking-tight mb-3">
          3D 모델을 업로드하고<br />바로 공유하세요
        </h2>
        <p className="text-zinc-400 text-lg">
          GLB, OBJ, STL 파일을 드래그하면 뷰어와 공유 링크가 생성됩니다
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-16 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
          dragging ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-3xl select-none">
          ⬆
        </div>
        <div className="text-center">
          <p className="font-medium text-zinc-200">파일을 드래그하거나 클릭해서 업로드</p>
          <p className="text-sm text-zinc-500 mt-1">{ACCEPTED.join(" · ").toUpperCase()} 지원</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={onFileChange}
      />

      <p className="text-xs text-zinc-600">최대 파일 크기 100MB · 업로드 후 영구 공유 링크 생성</p>
    </section>
  );
}
