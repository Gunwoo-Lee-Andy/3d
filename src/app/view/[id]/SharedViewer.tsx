"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ModelRecord } from "@/lib/db";

const GLBViewer = dynamic(() => import("../../components/GLBViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 text-sm">
      3D 모델 로딩 중…
    </div>
  ),
});

const ARViewer = dynamic(() => import("../../components/ARViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 text-sm">
      AR 뷰어 로딩 중…
    </div>
  ),
});

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function SharedViewer({ model }: { model: ModelRecord }) {
  const [arMode, setArMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: model.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-sm shrink-0">
        <a href="/" className="text-zinc-400 hover:text-white transition-colors">
          ← 홈
        </a>
        <div className="flex flex-col items-center">
          <span className="text-zinc-200 font-medium truncate max-w-[160px] sm:max-w-xs">
            {model.name}
          </span>
          <span className="text-zinc-600 text-xs">{formatSize(model.size)}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setArMode((v) => !v)}
            className={`transition-colors ${arMode ? "text-blue-400" : "text-zinc-400 hover:text-white"}`}
          >
            {arMode ? "3D" : "AR"}
          </button>
          <button
            onClick={handleShare}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? "복사됨!" : "공유"}
          </button>
          <a
            href={model.url}
            download={model.name}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            다운로드
          </a>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 min-h-0">
        {arMode ? <ARViewer url={model.url} /> : <GLBViewer url={model.url} />}
      </div>

      {/* 조회수 */}
      <div className="text-center py-2 text-xs text-zinc-700 shrink-0">
        조회수 {model.views.toLocaleString()}회
      </div>
    </div>
  );
}
