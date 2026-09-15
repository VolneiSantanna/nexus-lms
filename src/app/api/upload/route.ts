import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Por favor, envie uma imagem (JPG, PNG, WebP ou GIF)." },
        { status: 400 }
      );
    }

    // Gerar nome de arquivo único e seguro
    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    const uniqueFileName = `${cleanName}-${Date.now()}${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Se o Supabase estiver configurado, salvar no Supabase Storage
    if (supabase) {
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "lms-uploads";

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uniqueFileName);

        return NextResponse.json({ success: true, url: data.publicUrl });
      }

      console.warn("Falha no upload para Supabase Storage, recorrendo ao disco local:", uploadError);
    }

    // 2. Fallback: Gravar no disco local (desenvolvimento ou ambiente com disco persistente)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar o upload do arquivo." },
      { status: 500 }
    );
  }
}
