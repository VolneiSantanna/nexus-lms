import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // Limpar dados anteriores
  await prisma.lessonProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const studentPasswordHash = await bcrypt.hash("aluno123", 10);

  // 1. Criar Administrador
  const admin = await prisma.user.create({
    data: {
      name: "Administrador LMS",
      email: "admin@lms.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // 2. Criar Aluno de Teste
  const student = await prisma.user.create({
    data: {
      name: "Aluno Demonstração",
      email: "aluno@lms.com",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });

  // 3. Criar Curso Modelo
  const course = await prisma.course.create({
    data: {
      title: "Masterclass: Engenharia de Software & Streaming",
      slug: "masterclass-engenharia-streaming",
      description:
        "Domine o desenvolvimento de plataformas escaláveis, integração de vídeo sob demanda (VOD) e transmissões ao vivo de alta performance.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
      isPublished: true,
    },
  });

  // 4. Módulo 1: Fundamentos e Introdução
  const module1 = await prisma.module.create({
    data: {
      title: "Módulo 1: Introdução & Boas-Vindas",
      orderIndex: 1,
      courseId: course.id,
    },
  });

  // Aulas VOD
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "01. Boas-vindas ao Treinamento",
      slug: "01-boas-vindas",
      description:
        "Visão geral dos conteúdos, metodologia de estudo e orientações sobre como aproveitar ao máximo cada aula e cada transmissão ao vivo.",
      type: "VOD",
      videoEmbedCode:
        '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Aula Inaugural" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
      durationMinutes: 15,
      orderIndex: 1,
      moduleId: module1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "02. Arquitetura Moderna e Fluxo de Mídia",
      slug: "02-arquitetura-fluxo-midia",
      description:
        "Entenda como funcionam os players de vídeo, protocolos de streaming e como integrar sua plataforma com iframes otimizados.",
      type: "VOD",
      videoEmbedCode:
        '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Arquitetura de Vídeo" allowfullscreen></iframe>',
      durationMinutes: 28,
      orderIndex: 2,
      moduleId: module1.id,
    },
  });

  // 5. Módulo 2: Lives e Prática Interativa
  const module2 = await prisma.module.create({
    data: {
      title: "Módulo 2: Imersões ao Vivo e Estudos de Caso",
      orderIndex: 2,
      courseId: course.id,
    },
  });

  // Aula LIVE
  const liveDate = new Date();
  liveDate.setHours(liveDate.getHours() + 2); // Agendada para daqui a 2 horas

  await prisma.lesson.create({
    data: {
      title: "Super Live: Estratégias de Lançamento & Streaming",
      slug: "super-live-estrategias",
      description:
        "Transmissão ao vivo interativa para tirar dúvidas, debater os principais desafios e praticar em tempo real com o instrutor.",
      type: "LIVE",
      videoEmbedCode:
        '<iframe src="https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_BQQfLQ" title="Transmissão ao Vivo" allowfullscreen></iframe>',
      chatEmbedCode:
        '<iframe src="https://www.youtube.com/live_chat?v=live_stream&embed_domain=localhost" title="Chat da Transmissão"></iframe>',
      liveScheduledAt: liveDate,
      liveStatus: "SCHEDULED",
      durationMinutes: 90,
      orderIndex: 1,
      moduleId: module2.id,
    },
  });

  // 6. Matricular o aluno de teste no curso
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
    },
  });

  // 7. Marcar a primeira aula como concluída para o aluno de teste
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: lesson1.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log("👤 Admin: admin@lms.com | Senha: admin123");
  console.log("🎓 Aluno: aluno@lms.com | Senha: aluno123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
