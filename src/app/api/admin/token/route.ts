import { NextResponse } from "next/server";
import { getCurrentUser, signSessionToken } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const token = await signSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar token de API:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao gerar o token de API." },
      { status: 500 }
    );
  }
}
