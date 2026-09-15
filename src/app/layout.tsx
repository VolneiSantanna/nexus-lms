import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LMS Stream - Plataforma Educacional VOD & Live",
  description:
    "Plataforma moderna de cursos, aulas gravadas e transmissões ao vivo com chat interativo.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
        <Navbar user={user} />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
