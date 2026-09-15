import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Video, Radio, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-[#0b0d12]">
      {/* Top Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182030] border border-[#232d42] text-blue-400 text-xs font-semibold mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Sistema de Gestão de Aprendizagem
      </div>

      {/* Main Headline */}
      <h1 className="max-w-3xl text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight text-center">
        Educação online com transmissões ao vivo e conteúdo gravado sob demanda
      </h1>

      <p className="max-w-xl text-sm sm:text-base text-slate-400 mt-5 mb-8 text-center leading-relaxed">
        Uma experiência de estudo direta e focada. Assista aos módulos no seu ritmo, participe de
        lives interativas e acompanhe sua evolução de forma clara.
      </p>

      {/* Primary CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
        >
          Acessar a Plataforma
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 text-left">
        <div className="p-6 rounded-2xl bg-[#11141c] border border-[#1e2533]">
          <div className="w-10 h-10 rounded-lg bg-[#182030] text-blue-400 flex items-center justify-center mb-4 border border-[#232d42]">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Aulas sob Demanda (VOD)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Player responsivo integrado com a plataforma de streaming, navegação por módulos e
            memorização de conclusão de aulas.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#11141c] border border-[#1e2533]">
          <div className="w-10 h-10 rounded-lg bg-[#182030] text-blue-400 flex items-center justify-center mb-4 border border-[#232d42]">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Transmissões ao Vivo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ambiente de live com contagem regressiva para sessões agendadas, chat lateral integrado e
            status em tempo real.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#11141c] border border-[#1e2533]">
          <div className="w-10 h-10 rounded-lg bg-[#182030] text-blue-400 flex items-center justify-center mb-4 border border-[#232d42]">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Gestão Administrativa</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Painel completo para cadastro de alunos, organização de grade curricular e inserção rápida
            de códigos de embed de vídeo.
          </p>
        </div>
      </div>
    </div>
  );
}
