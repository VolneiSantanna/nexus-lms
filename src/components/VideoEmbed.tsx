"use client";

import React from "react";
import { VideoOff } from "lucide-react";

interface VideoEmbedProps {
  embedCode: string | null | undefined;
  title?: string;
}

export function VideoEmbed({ embedCode, title = "Aula" }: VideoEmbedProps) {
  if (!embedCode || !embedCode.trim()) {
    return (
      <div className="video-responsive-wrapper flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <VideoOff className="w-12 h-12 text-slate-500 mb-3" />
          <p className="text-sm font-medium">Nenhum vídeo configurado para esta aula.</p>
          <p className="text-xs text-slate-500 mt-1">O instrutor ainda não adicionou o conteúdo em vídeo.</p>
        </div>
      </div>
    );
  }

  // Extract iframe src if full iframe tag was provided, or treat as direct URL
  const trimmed = embedCode.trim();
  let videoSrc = trimmed;

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    videoSrc = srcMatch[1];
  }

  return (
    <div className="video-responsive-wrapper shadow-2xl border border-slate-800/80">
      <iframe
        src={videoSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full rounded-xl"
        loading="lazy"
      />
    </div>
  );
}
