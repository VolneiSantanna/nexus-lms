import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      type,
      videoEmbedCode,
      chatEmbedCode,
      liveScheduledAt,
      liveStatus,
      durationMinutes,
      durationSeconds,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "O título da aula é obrigatório." }, { status: 400 });
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        description,
        type,
        videoEmbedCode,
        chatEmbedCode: type === "LIVE" ? chatEmbedCode : null,
        liveScheduledAt: liveScheduledAt ? new Date(liveScheduledAt) : null,
        liveStatus: type === "LIVE" ? liveStatus : null,
        durationMinutes: durationMinutes !== undefined && durationMinutes !== null ? Number(durationMinutes) : 0,
        durationSeconds: durationSeconds !== undefined && durationSeconds !== null ? Number(durationSeconds) : 0,
      },
    });

    return NextResponse.json({ success: true, lesson: updated });
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao atualizar a aula." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.lesson.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
