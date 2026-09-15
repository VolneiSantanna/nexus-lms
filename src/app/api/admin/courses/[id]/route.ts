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
    const { title, description, thumbnailUrl } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "O título do curso é obrigatório." }, { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        thumbnailUrl,
      },
    });

    return NextResponse.json({ success: true, course: updated });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao atualizar o curso." },
      { status: 500 }
    );
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
    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao excluir curso." },
      { status: 500 }
    );
  }
}
