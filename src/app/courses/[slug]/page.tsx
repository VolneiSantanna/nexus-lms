import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Play, Radio, Clock, ArrowRight } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstLesson = allLessons[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0b0d12]">
      {/* Course Hero */}
      <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-7 rounded-2xl bg-[#11141c] border border-[#1e2533]">
        <div className="w-full md:w-72 aspect-video rounded-xl overflow-hidden bg-[#0b0d12] flex-shrink-0 border border-[#1e2533]">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <BookOpen className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-[#182030] px-2.5 py-1 rounded border border-[#232d42]">
              Curso Completo
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2.5">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#1e2533]">
            {firstLesson && (
              <Link
                href={`/courses/${course.slug}/lessons/${firstLesson.id}`}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Iniciar Treinamento
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Conteúdo Programático ({allLessons.length} aulas)
        </h2>

        <div className="space-y-3">
          {course.modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-xl bg-[#11141c] border border-[#1e2533] overflow-hidden"
            >
              <div className="p-3.5 bg-[#141822] border-b border-[#1e2533] font-bold text-xs text-white uppercase tracking-wider">
                {mod.title}
              </div>

              <div className="divide-y divide-[#181d28]">
                {mod.lessons.map((lesson) => {
                  const isLive = lesson.type === "LIVE";
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/lessons/${lesson.id}`}
                      className="p-3.5 flex items-center justify-between hover:bg-[#151924] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {isLive ? (
                          <Radio className="w-4 h-4 text-red-400" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-blue-400 fill-current" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                            {lesson.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {isLive ? (
                          <span className="text-red-400 font-semibold uppercase text-[10px] bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60">
                            Ao Vivo
                          </span>
                        ) : (
                          <span className="text-[11px]">{formatDuration(lesson.durationMinutes)}</span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
