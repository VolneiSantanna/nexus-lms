import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Play, Radio, Clock, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar cursos: se for ADMIN, exibe todos os cursos da plataforma; se for aluno, apenas matriculados
  let enrollments: Array<{
    course: {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      thumbnailUrl: string | null;
      modules: Array<{
        id: string;
        title: string;
        lessons: Array<{
          id: string;
          title: string;
          type: string;
          durationMinutes: number | null;
        }>;
      }>;
    };
  }> = [];

  if (user.role === "ADMIN") {
    const allCourses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
    enrollments = allCourses.map((c) => ({ course: c }));
  } else {
    enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { orderIndex: "asc" },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });
  }

  // Buscar progresso do aluno
  const userProgress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, isCompleted: true },
  });
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  // Próximas lives dos cursos relevantes
  const targetCourseIds = enrollments.map((e) => e.course.id);
  const upcomingLives = await prisma.lesson.findMany({
    where: {
      type: "LIVE",
      module: {
        courseId: { in: targetCourseIds },
      },
    },
    include: {
      module: {
        include: { course: true },
      },
    },
    orderBy: { liveScheduledAt: "asc" },
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-9 bg-[#0b0d12]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1e2533] pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Olá, {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Seus cursos e transmissões ao vivo em um só lugar.
          </p>
        </div>
      </div>

      {/* Destaque: Próximas Lives Agendadas */}
      {upcomingLives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Transmissões ao Vivo
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingLives.map((live) => {
              const liveDate = live.liveScheduledAt ? new Date(live.liveScheduledAt) : null;
              const isLiveNow = live.liveStatus === "LIVE";

              return (
                <div
                  key={live.id}
                  className="p-5 rounded-2xl bg-[#11141c] border border-[#1e2533] hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold text-slate-400 bg-[#182030] px-2 py-0.5 rounded border border-[#232d42]">
                        {live.module.course.title}
                      </span>
                      {isLiveNow ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 text-[10px] font-semibold border border-red-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          AO VIVO
                        </span>
                      ) : (
                        <span className="text-[10px] text-blue-400 font-semibold">Agendada</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-white text-sm leading-snug">
                      {live.title}
                    </h3>

                    {liveDate && (
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {format(liveDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/courses/${live.module.course.slug}/lessons/${live.id}`}
                    className="mt-5 w-full py-2 px-3 rounded-lg bg-[#182030] hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-[#232d42] hover:border-blue-500"
                  >
                    {isLiveNow ? "Entrar na Live Agora" : "Ver Detalhes da Sala"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meus Cursos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Cursos Disponíveis ({enrollments.length})
        </div>

        {enrollments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#11141c] border border-[#1e2533]">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">Nenhum curso matriculado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Você ainda não foi matriculado em nenhum curso. O administrador da plataforma pode
              adicionar você a uma turma.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map(({ course }) => {
              const allLessons = course.modules.flatMap((m) => m.lessons);
              const totalLessons = allLessons.length;
              const completedCount = allLessons.filter((l) =>
                completedLessonIds.has(l.id)
              ).length;
              const progressPercentage =
                totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

              const nextLesson =
                allLessons.find((l) => !completedLessonIds.has(l.id)) || allLessons[0];

              return (
                <div
                  key={course.id}
                  className="rounded-2xl bg-[#11141c] border border-[#1e2533] overflow-hidden flex flex-col hover:border-[#2a3447] transition-all group"
                >
                  {/* Capa */}
                  <div className="relative aspect-video w-full bg-[#0b0d12] overflow-hidden border-b border-[#1e2533]">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#11141c] text-slate-600">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-slate-300">
                      {totalLessons} {totalLessons === 1 ? "aula" : "aulas"}
                    </div>
                  </div>

                  {/* Detalhes do Curso */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h2 className="font-semibold text-base text-white group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h2>
                      {course.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1.5 pt-2 border-t border-[#1e2533]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          Progresso
                        </span>
                        <span className="font-semibold text-white">{progressPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1a202c] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    {nextLesson ? (
                      <Link
                        href={`/courses/${course.slug}/lessons/${nextLesson.id}`}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Continuar Assistindo
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#182030] hover:bg-[#20293d] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-[#232d42]"
                      >
                        Ver Grade do Curso
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
