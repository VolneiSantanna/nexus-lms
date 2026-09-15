import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminClientView } from "@/components/AdminClientView";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Apenas administradores podem acessar
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar todos os cursos com módulos e aulas
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { enrollments: true },
      },
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

  // Buscar todos os alunos com suas matrículas
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  // Calcular estatísticas
  const allLessons = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const totalVodLessons = allLessons.filter((l) => l.type === "VOD").length;
  const totalLiveLessons = allLessons.filter((l) => l.type === "LIVE").length;

  const stats = {
    totalStudents: students.length,
    totalCourses: courses.length,
    totalVodLessons,
    totalLiveLessons,
  };

  return <AdminClientView stats={stats} courses={courses} students={students} />;
}
