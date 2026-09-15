import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const { title, courseId, orderIndex } = await request.json();

    if (!title || !courseId) {
      return NextResponse.json(
        { error: "Título e ID do curso são obrigatórios." },
        { status: 400 }
      );
    }

    const moduleRecord = await prisma.module.create({
      data: {
        title,
        courseId,
        orderIndex: Number(orderIndex) || 0,
      },
    });

    return NextResponse.json({ success: true, module: moduleRecord }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
