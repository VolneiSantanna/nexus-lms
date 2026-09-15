import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const {
      title,
      description,
      type = "VOD",
      videoEmbedCode,
      chatEmbedCode,
      liveScheduledAt,
      liveStatus = "SCHEDULED",
      durationMinutes,
      moduleId,
    } = await request.json();

    if (!title || !moduleId) {
      return NextResponse.json(
        { error: "Título e Módulo são obrigatórios." },
        { status: 400 }
      );
    }

    // Slug
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .concat(`-${Date.now().toString().slice(-4)}`);

    // Pegar próximo orderIndex
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: "desc" },
    });
    const orderIndex = lastLesson ? lastLesson.orderIndex + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        description,
        type,
        videoEmbedCode,
        chatEmbedCode: type === "LIVE" ? chatEmbedCode : null,
        liveScheduledAt: liveScheduledAt ? new Date(liveScheduledAt) : null,
        liveStatus: type === "LIVE" ? liveStatus : null,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
        orderIndex,
        moduleId,
      },
    });

    return NextResponse.json({ success: true, lesson }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
