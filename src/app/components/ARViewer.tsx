"use client";

import { useEffect, useRef } from "react";

// model-viewer web component (Google)
// iOS: AR Quick Look (USDZ), Android: Scene Viewer (GLB)
// Types: src/types/model-viewer.d.ts

interface ARViewerProps {
  url: string;
}

export default function ARViewer({ url }: ARViewerProps) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  return (
    <model-viewer
      src={url}
      alt="3D 모델"
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      style={{ width: "100%", height: "100%", background: "#18181b" }}
    />
  );
}
