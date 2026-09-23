"use client";

import React, { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";

interface VideoEmbedProps {
  embedCode: string | null | undefined;
  title?: string;
}

export function VideoEmbed({ embedCode, title = "Aula" }: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = embedCode ? embedCode.trim() : "";

  // Executa eventuais scripts dentro do código de embed (ex: players como Panda Video, Bunny, etc.)
  useEffect(() => {
    if (!containerRef.current) return;
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.innerHTML) {
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [trimmed]);

  if (!trimmed) {
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

  // Se o código contiver tags <div>, preservamos a estrutura original completa
  // respeitando estilos de proporção (como vídeos verticais 9:16 do Spalla, 16:9, etc.)
  const hasDivWrapper = /<div/i.test(trimmed);

  if (hasDivWrapper) {
    return (
      <div className="w-full rounded-2xl bg-[#07090e] border border-[#1e2533] p-2 sm:p-4 shadow-2xl flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="w-full max-w-full [&_iframe]:rounded-xl [&_iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      </div>
    );
  }

  // Se for uma tag <iframe> pura sem divs envolventes
  const hasIframeTag = /<iframe/i.test(trimmed);

  if (hasIframeTag) {
    return (
      <div
        ref={containerRef}
        className="video-responsive-wrapper shadow-2xl border border-slate-800/80"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  // Caso seja apenas a URL direta (ex: "https://..."), montamos o iframe padrão responsivo
  let videoSrc = trimmed;
  if (videoSrc.includes("youtube.com/watch?v=")) {
    const videoId = videoSrc.split("watch?v=")[1]?.split("&")[0];
    if (videoId) videoSrc = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoSrc.includes("youtu.be/")) {
    const videoId = videoSrc.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) videoSrc = `https://www.youtube.com/embed/${videoId}`;
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
