import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const { userId, courseId, action } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: "IDs obrigatórios" }, { status: 400 });
    }

    if (action === "UNENROLL") {
      await prisma.enrollment.deleteMany({
        where: { userId, courseId },
      });
      return NextResponse.json({ success: true, message: "Matrícula removida." });
    }

    // ENROLL
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: { userId, courseId },
      update: {},
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("Erro ao gerenciar matrícula:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
