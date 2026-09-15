"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Play, BookOpen, Shield, LogOut, Menu, X, FileCode } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar menu mobile ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1e2533] bg-[#0b0d12]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-blue-500 transition-colors">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">
              Nexus<span className="text-blue-500 font-extrabold">LMS</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith("/dashboard") || pathname.startsWith("/courses")
                  ? "bg-[#182030] text-blue-400 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-[#141822]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Meus Cursos
            </Link>

            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === "/admin"
                      ? "bg-[#182030] text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:text-white hover:bg-[#141822]"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Painel Admin
                </Link>

                <Link
                  href="/admin/docs"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname.startsWith("/admin/docs")
                      ? "bg-[#182030] text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:text-white hover:bg-[#141822]"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  Docs da API
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User Info & Actions (Desktop) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#182030] border border-[#232d42] flex items-center justify-center text-white font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {user.role === "ADMIN" ? "Administrador" : "Aluno"}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block h-4 w-px bg-[#1e2533] mx-1" />

              <button
                onClick={handleLogout}
                title="Sair da conta"
                className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141822] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Botão Hambúrguer Mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#141822] border border-[#1e2533] transition-colors"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Menu Gaveta Mobile */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e2533] bg-[#0e1118]/95 backdrop-blur-lg px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Identificação do Usuário no Mobile */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141822] border border-[#1e2533]">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1e2533] text-blue-400 border border-[#2a3447]">
              {user.role === "ADMIN" ? "Admin" : "Aluno"}
            </span>
          </div>

          {/* Links de Navegação Mobile */}
          <div className="space-y-1 pt-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                pathname.startsWith("/dashboard") || pathname.startsWith("/courses")
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-[#141822]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Meus Cursos
            </Link>

            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    pathname === "/admin"
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-[#141822]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Painel Administrativo
                </Link>

                <Link
                  href="/admin/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    pathname.startsWith("/admin/docs")
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-[#141822]"
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  Documentação da API
                </Link>
              </>
            )}
          </div>

          {/* Botão Sair Mobile */}
          <div className="pt-2 border-t border-[#1e2533]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 text-red-400 text-xs font-semibold border border-red-900/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
