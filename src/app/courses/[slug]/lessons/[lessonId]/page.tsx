import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonClientView } from "@/components/LessonClientView";

interface PageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export default async function CourseLessonPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { slug, lessonId } = await params;

  // Buscar curso completo com módulos e aulas
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

  // Verificar matrícula (Admin tem acesso livre)
  if (user.role !== "ADMIN") {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!enrollment) {
      redirect("/dashboard");
    }
  }

  // Encontrar a aula atual
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);

  if (currentLessonIndex === -1) {
    notFound();
  }

  const currentLesson = allLessons[currentLessonIndex];
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Buscar progresso do aluno para as aulas deste curso
  const userProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
  });

  const completedLessonIds = userProgress
    .filter((p) => p.isCompleted)
    .map((p) => p.lessonId);

  const initialIsCompleted = completedLessonIds.includes(currentLesson.id);

  return (
    <LessonClientView
      course={course}
      lesson={currentLesson}
      initialIsCompleted={initialIsCompleted}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
      completedLessonIds={completedLessonIds}
    />
  );
}
