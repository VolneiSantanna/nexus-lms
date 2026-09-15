"use client";

import React, { useState, useEffect } from "react";
import { VideoEmbed } from "./VideoEmbed";
import { Calendar, Radio, MessageSquare, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LiveRoomProps {
  title: string;
  videoEmbedCode: string | null | undefined;
  chatEmbedCode: string | null | undefined;
  liveScheduledAt: string | Date | null | undefined;
  liveStatus: "SCHEDULED" | "LIVE" | "ENDED" | string | null | undefined;
}

export function LiveRoom({
  title,
  videoEmbedCode,
  chatEmbedCode,
  liveScheduledAt,
  liveStatus = "SCHEDULED",
}: LiveRoomProps) {
  const [showChat, setShowChat] = useState(true);
  const [mobileTab, setMobileTab] = useState<"video" | "chat">("video");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const scheduledDate = liveScheduledAt ? new Date(liveScheduledAt) : null;

  useEffect(() => {
    if (!scheduledDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = scheduledDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [liveScheduledAt]);

  let chatSrc = chatEmbedCode?.trim() || "";
  const chatSrcMatch = chatSrc.match(/src=["']([^"']+)["']/i);
  if (chatSrcMatch && chatSrcMatch[1]) {
    chatSrc = chatSrcMatch[1];
  }

  const isLive = liveStatus === "LIVE";
  const isEnded = liveStatus === "ENDED";
  const isScheduled = liveStatus === "SCHEDULED";

  return (
    <div className="space-y-4">
      {/* Live Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#11141c] border border-[#1e2533]">
        <div className="flex items-center gap-3">
          {isLive ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/60 text-red-400 text-xs font-semibold border border-red-800/60">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              AO VIVO AGORA
            </span>
          ) : isEnded ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#182030] text-slate-300 text-xs font-semibold border border-[#232d42]">
              TRANSMISSÃO ENCERRADA
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#182030] text-blue-400 text-xs font-semibold border border-[#232d42]">
              <Calendar className="w-3.5 h-3.5" />
              TRANSMISSÃO AGENDADA
            </span>
          )}

          {scheduledDate && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {format(scheduledDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>

        {/* Desktop Chat Toggle Button */}
        {chatEmbedCode && (
          <button
            onClick={() => setShowChat(!showChat)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#182030] hover:bg-[#20293d] text-slate-200 transition-colors border border-[#232d42]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            {showChat ? "Ocultar Chat" : "Exibir Chat"}
          </button>
        )}

        {/* Mobile Tabs */}
        {chatEmbedCode && (
          <div className="flex md:hidden rounded-lg bg-[#182030] p-1 border border-[#232d42]">
            <button
              onClick={() => setMobileTab("video")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mobileTab === "video"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Transmissão
            </button>
            <button
              onClick={() => setMobileTab("chat")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mobileTab === "chat"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Chat
            </button>
          </div>
        )}
      </div>

      {/* Countdown Card */}
      {isScheduled && !timeLeft.isPast && scheduledDate && (
        <div className="p-6 rounded-2xl bg-[#11141c] border border-[#1e2533] text-center shadow-md">
          <p className="text-xs font-semibold tracking-wider text-blue-400 uppercase mb-3">
            Início da Transmissão
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-6 my-2">
            {timeLeft.days > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono bg-[#0b0d12] border border-[#1e2533] px-3.5 py-2 rounded-xl">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase text-slate-400 mt-1 font-semibold">Dias</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono bg-[#0b0d12] border border-[#1e2533] px-3.5 py-2 rounded-xl">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase text-slate-400 mt-1 font-semibold">Horas</span>
            </div>
            <span className="text-lg font-bold text-slate-600 self-center -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono bg-[#0b0d12] border border-[#1e2533] px-3.5 py-2 rounded-xl">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase text-slate-400 mt-1 font-semibold">Min</span>
            </div>
            <span className="text-lg font-bold text-slate-600 self-center -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono bg-[#0b0d12] border border-[#1e2533] px-3.5 py-2 rounded-xl">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase text-slate-400 mt-1 font-semibold">Seg</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Player + Chat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stream Video */}
        <div
          className={`transition-all duration-200 ${
            showChat && chatEmbedCode ? "md:col-span-8 lg:col-span-9" : "md:col-span-12"
          } ${mobileTab === "chat" ? "hidden md:block" : "block"}`}
        >
          <VideoEmbed embedCode={videoEmbedCode} title={title} />
        </div>

        {/* Chat Panel */}
        {chatEmbedCode && (
          <div
            className={`transition-all duration-200 ${
              showChat ? "md:col-span-4 lg:col-span-3" : "hidden"
            } ${mobileTab === "video" ? "hidden md:block" : "block"}`}
          >
            <div className="h-[450px] md:h-full min-h-[420px] rounded-xl border border-[#1e2533] bg-[#0b0d12] flex flex-col overflow-hidden">
              <div className="px-3.5 py-2.5 bg-[#11141c] border-b border-[#1e2533] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Chat da Live
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Chat Ativo" />
              </div>
              <div className="flex-1 w-full bg-[#0b0d12] relative">
                <iframe
                  src={chatSrc}
                  title="Chat da Live"
                  className="w-full h-full absolute inset-0 border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
