"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoEmbed } from "./VideoEmbed";
import { LiveRoom } from "./LiveRoom";
import {
  CheckCircle,
  Circle,
  Play,
  Radio,
  Clock,
  ArrowRight,
  BookOpen,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface LessonClientViewProps {
  course: {
    title: string;
    slug: string;
    modules: {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        type: string;
        durationMinutes: number | null;
        durationSeconds?: number | null;
        liveStatus?: string | null;
        liveScheduledAt?: Date | string | null;
      }[];
    }[];
  };
  lesson: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    type: string;
    videoEmbedCode: string | null;
    chatEmbedCode: string | null;
    liveScheduledAt: Date | string | null;
    liveStatus: string | null;
    durationMinutes: number | null;
    durationSeconds?: number | null;
  };
  initialIsCompleted: boolean;
  nextLesson: {
    id: string;
    title: string;
  } | null;
  prevLesson: {
    id: string;
    title: string;
  } | null;
  completedLessonIds: string[];
}

export function LessonClientView({
  course,
  lesson,
  initialIsCompleted,
  nextLesson,
  prevLesson,
  completedLessonIds: initialCompletedIds,
}: LessonClientViewProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleProgress = async () => {
    setLoadingProgress(true);
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);

    if (newStatus) {
      setCompletedIds((prev) => [...prev, lesson.id]);
    } else {
      setCompletedIds((prev) => prev.filter((id) => id !== lesson.id));
    }

    try {
      await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar progresso", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const isLiveType = lesson.type === "LIVE";

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-[#0b0d12]">
      {/* Coluna Principal: Player & Detalhes da Aula */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Top Breadcrumb & Mobile Button */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Meus Cursos
            </Link>
            <span>/</span>
            <span className="text-white font-medium truncate">{course.title}</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182030] text-slate-200 border border-[#232d42]"
          >
            <Menu className="w-3.5 h-3.5" />
            Ementa
          </button>
        </div>

        {/* Video / Live Player */}
        <div>
          {isLiveType ? (
            <LiveRoom
              title={lesson.title}
              videoEmbedCode={lesson.videoEmbedCode}
              chatEmbedCode={lesson.chatEmbedCode}
              liveScheduledAt={lesson.liveScheduledAt}
              liveStatus={lesson.liveStatus}
            />
          ) : (
            <VideoEmbed embedCode={lesson.videoEmbedCode} title={lesson.title} />
          )}
        </div>

        {/* Lesson Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#11141c] border border-[#1e2533]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isLiveType
                    ? "bg-red-950/60 text-red-400 border border-red-800/60"
                    : "bg-[#182030] text-blue-400 border border-[#232d42]"
                }`}
              >
                {isLiveType ? "Live Streaming" : "Aula VOD"}
              </span>

              {(lesson.durationMinutes || lesson.durationSeconds) ? (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatDuration(lesson.durationMinutes, lesson.durationSeconds)}
                </span>
              ) : null}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {lesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Botão de Marcar como Concluída */}
            <button
              onClick={toggleProgress}
              disabled={loadingProgress}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all ${
                isCompleted
                  ? "bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Aula Concluída
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Concluir Aula
                </>
              )}
            </button>

            {/* Próxima Aula */}
            {nextLesson && (
              <Link
                href={`/courses/${course.slug}/lessons/${nextLesson.id}`}
                className="px-3.5 py-2 rounded-xl bg-[#182030] hover:bg-[#20293d] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-[#232d42]"
              >
                Próxima
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Descrição da Aula */}
        {lesson.description && (
          <div className="p-6 rounded-2xl bg-[#11141c] border border-[#1e2533] space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Descrição do Conteúdo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {lesson.description}
            </p>
          </div>
        )}
      </div>

      {/* Sidebar de Aulas */}
      <aside
        className={`fixed lg:sticky top-16 right-0 z-40 w-80 sm:w-96 h-[calc(100vh-4rem)] bg-[#0e1118] border-l border-[#1e2533] flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-[#1e2533] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Grade Curricular
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id} className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                {mod.title}
              </span>

              <div className="space-y-1">
                {mod.lessons.map((l) => {
                  const isCurrent = l.id === lesson.id;
                  const isDone = completedIds.includes(l.id);
                  const isLive = l.type === "LIVE";

                  return (
                    <Link
                      key={l.id}
                      href={`/courses/${course.slug}/lessons/${l.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-all ${
                        isCurrent
                          ? "bg-[#182030] text-blue-400 border border-blue-500/40 font-semibold"
                          : "text-slate-300 hover:bg-[#141822] hover:text-white"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        ) : isLive ? (
                          <Radio className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="truncate leading-tight">{l.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          {isLive ? (
                            <span className="text-red-400 font-semibold">LIVE</span>
                          ) : (
                            <span>{formatDuration(l.durationMinutes, l.durationSeconds)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
