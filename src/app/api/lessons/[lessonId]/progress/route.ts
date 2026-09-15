import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { lessonId } = await params;
    const body = await request.json().catch(() => ({}));
    const shouldComplete = body.isCompleted !== undefined ? body.isCompleted : true;

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
      create: {
        userId: user.id,
        lessonId: lessonId,
        isCompleted: shouldComplete,
        completedAt: shouldComplete ? new Date() : null,
      },
      update: {
        isCompleted: shouldComplete,
        completedAt: shouldComplete ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
