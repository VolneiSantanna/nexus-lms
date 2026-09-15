"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Video,
  Radio,
  Plus,
  Play,
  Pencil,
  Trash2,
  Users,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  UserPlus,
  UserX,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageUploader } from "./ImageUploader";

interface CourseManageClientViewProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    createdAt: string | Date;
    _count?: {
      enrollments: number;
    };
    modules: Array<{
      id: string;
      title: string;
      orderIndex: number;
      lessons: Array<{
        id: string;
        title: string;
        description: string | null;
        type: string;
        durationMinutes: number | null;
        liveStatus: string | null;
        liveScheduledAt: string | Date | null;
        videoEmbedCode: string | null;
        chatEmbedCode: string | null;
        orderIndex: number;
      }>;
    }>;
    enrollments: Array<{
      id: string;
      enrolledAt: string | Date;
      user: {
        id: string;
        name: string;
        email: string;
        createdAt: string | Date;
      };
    }>;
  };
  allStudents: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export function CourseManageClientView({
  course,
  allStudents,
}: CourseManageClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"curriculum" | "students">("curriculum");

  // Modals
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null); // moduleId
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Edit Course Form
  const [editCourseData, setEditCourseData] = useState({
    title: course.title,
    description: course.description || "",
    thumbnailUrl: course.thumbnailUrl || "",
  });

  // New Module Form
  const [newModuleTitle, setNewModuleTitle] = useState("");

  // New Lesson Form
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    type: "VOD" as "VOD" | "LIVE",
    videoEmbedCode: "",
    chatEmbedCode: "",
    liveScheduledAt: "",
    liveStatus: "SCHEDULED" as "SCHEDULED" | "LIVE" | "ENDED",
    durationMinutes: 20,
  });

  // Edit Lesson State
  const [editingLesson, setEditingLesson] = useState<{
    id: string;
    title: string;
    description: string;
    type: "VOD" | "LIVE";
    videoEmbedCode: string;
    chatEmbedCode: string;
    liveScheduledAt: string;
    liveStatus: "SCHEDULED" | "LIVE" | "ENDED";
    durationMinutes: number;
  } | null>(null);

  // Search in enrolled students
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalVod = allLessons.filter((l) => l.type === "VOD").length;
  const totalLive = allLessons.filter((l) => l.type === "LIVE").length;

  const enrolledUserIds = new Set(course.enrollments.map((e) => e.user.id));
  const availableStudents = allStudents.filter((s) => !enrolledUserIds.has(s.id));

  const filteredEnrolledStudents = course.enrollments.filter(
    (e) =>
      e.user.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      e.user.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Handlers
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCourseData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao atualizar curso");
        setLoading(false);
        return;
      }

      setShowEditCourse(false);
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão ao salvar alterações do curso");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm(`Tem certeza que deseja excluir o curso "${course.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        alert("Erro ao excluir curso");
      }
    } catch {
      alert("Erro de conexão ao excluir curso");
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newModuleTitle,
          courseId: course.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao criar módulo");
        setLoading(false);
        return;
      }

      setShowAddModule(false);
      setNewModuleTitle("");
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLesson) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLesson,
          moduleId: showAddLesson,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao criar aula");
        setLoading(false);
        return;
      }

      setShowAddLesson(null);
      setNewLesson({
        title: "",
        description: "",
        type: "VOD",
        videoEmbedCode: "",
        chatEmbedCode: "",
        liveScheduledAt: "",
        liveStatus: "SCHEDULED",
        durationMinutes: 20,
      });
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLesson),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao atualizar aula");
        setLoading(false);
        return;
      }

      setEditingLesson(null);
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão ao salvar aula");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Deseja realmente excluir esta aula?")) return;

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erro ao excluir aula");
      }
    } catch {
      alert("Erro de conexão");
    }
  };

  const handleEnrollStudent = async (userId: string, action: "ENROLL" | "UNENROLL") => {
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId: course.id,
          action,
        }),
      });

      if (res.ok) {
        setShowEnrollModal(false);
        setSelectedStudentToEnroll("");
        router.refresh();
      }
    } catch {
      alert("Erro ao gerenciar matrícula");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0b0d12] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Painel Admin
        </Link>
        <span>/</span>
        <span className="text-slate-400">Cursos</span>
        <span>/</span>
        <span className="text-white font-medium truncate max-w-xs sm:max-w-md">
          {course.title}
        </span>
      </div>

      {/* Hero Header do Curso */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-[#1e2533] shadow-xl flex flex-col md:flex-row gap-6 items-start">
        {/* Capa */}
        <div className="w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-[#0b0d12] border border-[#1e2533] shrink-0 relative group">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <BookOpen className="w-10 h-10 text-blue-500" />
            </div>
          )}
        </div>

        {/* Informações & Ações */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditCourseData({
                    title: course.title,
                    description: course.description || "",
                    thumbnailUrl: course.thumbnailUrl || "",
                  });
                  setShowEditCourse(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#182030] hover:bg-[#20293d] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-[#2e374d] transition-all"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                Editar Curso
              </button>
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-[#182030] hover:bg-[#20293d] text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-[#232d42] transition-all"
                title="Abrir como aluno em nova aba"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver Curso
              </Link>
              <button
                onClick={handleDeleteCourse}
                className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="Excluir curso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Badges de Métricas do Curso */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1e2533] text-xs">
            <span className="px-3 py-1 rounded-lg bg-[#141822] text-slate-300 border border-[#1e2533] flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              {course.modules.length} {course.modules.length === 1 ? "módulo" : "módulos"}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#141822] text-slate-300 border border-[#1e2533] flex items-center gap-1.5 font-medium">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              {totalVod} {totalVod === 1 ? "aula VOD" : "aulas VOD"}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#141822] text-slate-300 border border-[#1e2533] flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-red-400" />
              {totalLive} {totalLive === 1 ? "live" : "lives"}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#141822] text-slate-300 border border-[#1e2533] flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {course.enrollments.length} {course.enrollments.length === 1 ? "aluno matriculado" : "alunos matriculados"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e2533] gap-6">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "curriculum"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          Grade Curricular (Módulos & Aulas)
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "students"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Alunos Matriculados ({course.enrollments.length})
        </button>
      </div>

      {/* TAB 1: GRADE CURRICULAR */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Ementa do Treinamento</h2>
            <button
              onClick={() => setShowAddModule(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Módulo
            </button>
          </div>

          {course.modules.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#11141c] border border-[#1e2533] text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Nenhum módulo criado ainda</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Organize seu curso em módulos para agrupar aulas gravadas (VOD) e transmissões ao vivo (Lives).
              </p>
              <button
                onClick={() => setShowAddModule(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Criar Primeiro Módulo
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-[#1e2533] bg-[#11141c] overflow-hidden"
                >
                  {/* Module Header */}
                  <div className="p-4 bg-[#141822] border-b border-[#1e2533] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#182030] text-blue-400 flex items-center justify-center font-bold text-xs border border-[#232d42]">
                        {mod.orderIndex}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                        <p className="text-[11px] text-slate-400">
                          {mod.lessons.length} {mod.lessons.length === 1 ? "aula" : "aulas"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddLesson(mod.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1 border border-[#232d42] transition-all self-end sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Aula / Live
                    </button>
                  </div>

                  {/* Lessons list */}
                  <div className="divide-y divide-[#181d28]">
                    {mod.lessons.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Nenhuma aula cadastrada neste módulo. Clique em "+ Adicionar Aula" acima.
                      </div>
                    ) : (
                      mod.lessons.map((lesson) => {
                        const isLive = lesson.type === "LIVE";

                        return (
                          <div
                            key={lesson.id}
                            onClick={() =>
                              setEditingLesson({
                                id: lesson.id,
                                title: lesson.title,
                                description: lesson.description || "",
                                type: lesson.type as "VOD" | "LIVE",
                                videoEmbedCode: lesson.videoEmbedCode || "",
                                chatEmbedCode: lesson.chatEmbedCode || "",
                                liveScheduledAt: lesson.liveScheduledAt
                                  ? format(new Date(lesson.liveScheduledAt), "yyyy-MM-dd'T'HH:mm")
                                  : "",
                                liveStatus: (lesson.liveStatus as "SCHEDULED" | "LIVE" | "ENDED") || "SCHEDULED",
                                durationMinutes: lesson.durationMinutes || 20,
                              })
                            }
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#151924] transition-colors group cursor-pointer"
                            title="Clique para editar esta aula"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {isLive ? (
                                <span className="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-900/50 shrink-0">
                                  <Radio className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="p-2 rounded-lg bg-[#182030] text-blue-400 border border-[#232d42] shrink-0">
                                  <Video className="w-4 h-4" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                                  <span>{isLive ? "Live Streaming" : "VOD (Gravada)"}</span>
                                  {lesson.durationMinutes && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.durationMinutes} min
                                    </span>
                                  )}
                                  {isLive && lesson.liveScheduledAt && (
                                    <span className="text-amber-400">
                                      {format(new Date(lesson.liveScheduledAt), "dd/MM/yyyy HH:mm")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-2 self-end sm:self-auto shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={`/courses/${course.slug}/lessons/${lesson.id}`}
                                target="_blank"
                                className="px-2.5 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1 text-xs font-semibold shadow-sm"
                                title="Assistir como aluno"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                Assistir
                              </Link>
                              <button
                                onClick={() =>
                                  setEditingLesson({
                                    id: lesson.id,
                                    title: lesson.title,
                                    description: lesson.description || "",
                                    type: lesson.type as "VOD" | "LIVE",
                                    videoEmbedCode: lesson.videoEmbedCode || "",
                                    chatEmbedCode: lesson.chatEmbedCode || "",
                                    liveScheduledAt: lesson.liveScheduledAt
                                      ? format(new Date(lesson.liveScheduledAt), "yyyy-MM-dd'T'HH:mm")
                                      : "",
                                    liveStatus: (lesson.liveStatus as "SCHEDULED" | "LIVE" | "ENDED") || "SCHEDULED",
                                    durationMinutes: lesson.durationMinutes || 20,
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white bg-[#182030] hover:bg-[#20293d] transition-all flex items-center gap-1 text-xs font-medium border border-[#232d42]"
                              >
                                <Pencil className="w-3 h-3" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                title="Excluir aula"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALUNOS MATRICULADOS */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Buscar aluno matriculado..."
                className="w-full pl-9 pr-4 py-2 bg-[#11141c] border border-[#1e2533] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Matricular Aluno nesta Turma
            </button>
          </div>

          <div className="rounded-2xl border border-[#1e2533] bg-[#11141c] overflow-hidden">
            {filteredEnrolledStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum aluno encontrado nesta turma.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1118] border-b border-[#1e2533] text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Aluno</th>
                      <th className="p-3.5">E-mail</th>
                      <th className="p-3.5">Data da Matrícula</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181d28]">
                    {filteredEnrolledStudents.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-[#141822] transition-colors">
                        <td className="p-3.5 font-semibold text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                            {enrollment.user.name.charAt(0).toUpperCase()}
                          </div>
                          {enrollment.user.name}
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                          {enrollment.user.email}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {format(new Date(enrollment.enrolledAt), "dd/MM/yyyy")}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleEnrollStudent(enrollment.user.id, "UNENROLL")}
                            className="px-2.5 py-1 rounded-lg text-red-400 hover:text-white hover:bg-red-950/50 text-[11px] font-medium border border-red-900/40 transition-colors"
                          >
                            Remover Matrícula
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CURSO */}
      {showEditCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white">Editar Curso</h2>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Curso
                </label>
                <input
                  type="text"
                  required
                  value={editCourseData.title}
                  onChange={(e) =>
                    setEditCourseData({ ...editCourseData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editCourseData.description}
                  onChange={(e) =>
                    setEditCourseData({ ...editCourseData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <ImageUploader
                value={editCourseData.thumbnailUrl}
                onChange={(url) => setEditCourseData({ ...editCourseData, thumbnailUrl: url })}
                label="Capa do Curso"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setShowEditCourse(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MÓDULO */}
      {showAddModule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Adicionar Novo Módulo</h2>

            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Módulo
                </label>
                <input
                  type="text"
                  required
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Ex: Módulo 1: Fundamentos"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  {loading ? "Criando..." : "Criar Módulo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA AULA */}
      {showAddLesson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white">Adicionar Aula ou Live</h2>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Aula
                </label>
                <input
                  type="text"
                  required
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="Ex: Aula 01 - Introdução ao Player"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Conteúdo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewLesson({ ...newLesson, type: "VOD" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      newLesson.type === "VOD"
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-[#0b0d12] border-[#1e2533] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Aula Gravada (VOD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLesson({ ...newLesson, type: "LIVE" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      newLesson.type === "LIVE"
                        ? "bg-red-600/10 border-red-500 text-red-400"
                        : "bg-[#0b0d12] border-[#1e2533] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    Transmissão ao Vivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código de Embed do Player (&lt;iframe&gt;)
                </label>
                <textarea
                  value={newLesson.videoEmbedCode}
                  onChange={(e) => setNewLesson({ ...newLesson, videoEmbedCode: e.target.value })}
                  placeholder='Cole a tag <iframe src="..."></iframe> do seu serviço de streaming'
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {newLesson.type === "LIVE" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Código de Embed do Chat (&lt;iframe&gt;)
                    </label>
                    <textarea
                      value={newLesson.chatEmbedCode}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, chatEmbedCode: e.target.value })
                      }
                      placeholder='<iframe src="...chat..."></iframe>'
                      rows={2}
                      className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Data e Hora da Live
                      </label>
                      <input
                        type="datetime-local"
                        value={newLesson.liveScheduledAt}
                        onChange={(e) =>
                          setNewLesson({ ...newLesson, liveScheduledAt: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Status Inicial
                      </label>
                      <select
                        value={newLesson.liveStatus}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            liveStatus: e.target.value as "SCHEDULED" | "LIVE" | "ENDED",
                          })
                        }
                        className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="SCHEDULED">Agendada</option>
                        <option value="LIVE">Ao Vivo Agora</option>
                        <option value="ENDED">Encerrada</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração Estimada (Minutos)
                  </label>
                  <input
                    type="number"
                    value={newLesson.durationMinutes}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição / Resumo
                </label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="Informações adicionais para os alunos..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setShowAddLesson(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  {loading ? "Salvando..." : "Criar Aula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR AULA */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white">Editar Aula</h2>

            <form onSubmit={handleUpdateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Aula
                </label>
                <input
                  type="text"
                  required
                  value={editingLesson.title}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingLesson({ ...editingLesson, type: "VOD" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      editingLesson.type === "VOD"
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-[#0b0d12] border-[#1e2533] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Aula Gravada (VOD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLesson({ ...editingLesson, type: "LIVE" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      editingLesson.type === "LIVE"
                        ? "bg-red-600/10 border-red-500 text-red-400"
                        : "bg-[#0b0d12] border-[#1e2533] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    Transmissão ao Vivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Embed do Player (&lt;iframe&gt;)
                </label>
                <textarea
                  value={editingLesson.videoEmbedCode}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, videoEmbedCode: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {editingLesson.type === "LIVE" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Embed do Chat (&lt;iframe&gt;)
                    </label>
                    <textarea
                      value={editingLesson.chatEmbedCode}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, chatEmbedCode: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Data e Hora
                      </label>
                      <input
                        type="datetime-local"
                        value={editingLesson.liveScheduledAt}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            liveScheduledAt: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Status da Live
                      </label>
                      <select
                        value={editingLesson.liveStatus}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            liveStatus: e.target.value as "SCHEDULED" | "LIVE" | "ENDED",
                          })
                        }
                        className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="SCHEDULED">Agendada</option>
                        <option value="LIVE">Ao Vivo Agora</option>
                        <option value="ENDED">Encerrada</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração Estimada (Minutos)
                  </label>
                  <input
                    type="number"
                    value={editingLesson.durationMinutes}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editingLesson.description}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MATRICULAR ALUNO NESTE CURSO */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Matricular Aluno nesta Turma</h2>

            {availableStudents.length === 0 ? (
              <p className="text-xs text-slate-400">
                Todos os alunos cadastrados na plataforma já estão matriculados neste curso.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Selecione o Aluno
                  </label>
                  <select
                    value={selectedStudentToEnroll}
                    onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Escolha um aluno...</option>
                    {availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnrollModal(false);
                      setSelectedStudentToEnroll("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!selectedStudentToEnroll}
                    onClick={() => handleEnrollStudent(selectedStudentToEnroll, "ENROLL")}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
                  >
                    Confirmar Matrícula
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
