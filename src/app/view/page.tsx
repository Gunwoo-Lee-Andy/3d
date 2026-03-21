"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const GLBViewer = dynamic(() => import("../components/GLBViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 text-sm">
      3D 모델 로딩 중…
    </div>
  ),
});

function ViewerContent() {
  const params = useSearchParams();
  const url = params.get("url");

  if (!url) {
    return (
      <div className="flex items-center justify-center flex-1 text-zinc-500">
        URL 파라미터가 없습니다. <code className="ml-2 text-zinc-400">?url=파일경로</code>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-sm">
        <a href="/" className="text-zinc-400 hover:text-white transition-colors">← 홈</a>
        <span className="text-zinc-500 truncate max-w-xs">{decodeURIComponent(url)}</span>
        <div className="flex gap-3">
          <button className="text-zinc-400 hover:text-white transition-colors">공유</button>
          <button className="text-zinc-400 hover:text-white transition-colors">AR 보기</button>
        </div>
      </div>
      {/* Viewer */}
      <div className="flex-1 min-h-0">
        <GLBViewer url={decodeURIComponent(url)} />
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <Suspense
        fallback={
          <div className="flex items-center justify-center flex-1 text-zinc-500">
            로딩 중…
          </div>
        }
      >
        <ViewerContent />
      </Suspense>
    </div>
  );
}
