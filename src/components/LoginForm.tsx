"use client";

import React, { useState } from "react";
import { Play, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciais incorretas.");
        setLoading(false);
        return;
      }

      // Usar window.location.replace para substituir a página de login no histórico do navegador.
      // Isso impede que o botão "Voltar" do navegador tente retornar à tela de login.
      const target = data.user?.role === "ADMIN" ? "/admin" : "/dashboard";
      window.location.replace(target);
    } catch {
      setError("Falha na conexão com o servidor.");
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#0b0d12]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-sm">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Acessar Plataforma
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Entre com suas credenciais para acessar seus cursos e lives
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl p-7 shadow-xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nome@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0b0d12] border border-[#232a3b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0b0d12] border border-[#232a3b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Atalhos para teste rápido */}
          <div className="mt-6 pt-5 border-t border-[#1e2533]">
            <p className="text-[11px] font-medium text-slate-400 mb-2.5 text-center">
              Acesso rápido para testes:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("aluno@lms.com", "aluno123")}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-[#182030] hover:bg-[#1e283d] text-blue-300 border border-[#232d42] transition-colors"
              >
                Aluno Teste
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@lms.com", "admin123")}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-[#181c26] hover:bg-[#202533] text-slate-200 border border-[#262c3b] transition-colors"
              >
                Administrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
