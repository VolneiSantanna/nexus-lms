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
    const { title, orderIndex } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "O título do módulo é obrigatório." }, { status: 400 });
    }

    const updated = await prisma.module.update({
      where: { id },
      data: {
        title: title.trim(),
        ...(orderIndex !== undefined ? { orderIndex: Number(orderIndex) } : {}),
      },
    });

    return NextResponse.json({ success: true, module: updated });
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao atualizar o módulo." },
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

    await prisma.module.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao excluir o módulo." },
      { status: 500 }
    );
  }
}
