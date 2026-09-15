"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Video,
  Radio,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  Key,
  Copy,
  Check,
  FileCode,
  ArrowRight,
  X,
  Shield,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageUploader } from "./ImageUploader";

interface AdminClientViewProps {
  stats: {
    totalStudents: number;
    totalCourses: number;
    totalVodLessons: number;
    totalLiveLessons: number;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
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
        type: string;
        durationMinutes: number | null;
        liveStatus: string | null;
        liveScheduledAt: string | Date | null;
        videoEmbedCode: string | null;
        chatEmbedCode: string | null;
      }>;
    }>;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string | Date;
    enrollments: Array<{
      courseId: string;
      course: { id: string; title: string };
    }>;
  }>;
}

export function AdminClientView({ stats, courses, students }: AdminClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"courses" | "students">("courses");

  // Search filters
  const [searchStudent, setSearchStudent] = useState("");
  const [searchCourse, setSearchCourse] = useState("");

  // Pagination for students
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // Slide-over Drawer for Student
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<{
    id: string;
    name: string;
    email: string;
    createdAt: string | Date;
    enrollments: Array<{
      courseId: string;
      course: { id: string; title: string };
    }>;
  } | null>(null);

  // Modal states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Token state
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    selectedCourseIds: [] as string[],
  });

  // New Course Form
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
  });

  // Edit Course State
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Token handlers
  const handleOpenTokenModal = () => {
    setShowTokenModal(true);
    if (!apiToken) {
      handleGenerateToken();
    }
  };

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    try {
      const res = await fetch("/api/admin/token", { method: "POST" });
      const data = await res.json();
      if (data.token) {
        setApiToken(data.token);
      }
    } catch (err) {
      console.error("Erro ao gerar token", err);
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (!apiToken) return;
    navigator.clipboard.writeText(apiToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  // Student handlers
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          password: newStudent.password,
          courseIds: newStudent.selectedCourseIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao criar aluno");
        setLoading(false);
        return;
      }

      setShowAddStudent(false);
      setNewStudent({
        name: "",
        email: "",
        password: "",
        selectedCourseIds: [],
      });
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão ao criar aluno");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnrollment = async (
    userId: string,
    courseId: string,
    isEnrolled: boolean
  ) => {
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId,
          action: isEnrolled ? "UNENROLL" : "ENROLL",
        }),
      });

      if (res.ok) {
        // Atualizar estado do drawer se estiver aberto
        if (selectedStudentForDrawer && selectedStudentForDrawer.id === userId) {
          if (isEnrolled) {
            setSelectedStudentForDrawer({
              ...selectedStudentForDrawer,
              enrollments: selectedStudentForDrawer.enrollments.filter(
                (e) => e.courseId !== courseId
              ),
            });
          } else {
            const courseToAdd = courses.find((c) => c.id === courseId);
            if (courseToAdd) {
              setSelectedStudentForDrawer({
                ...selectedStudentForDrawer,
                enrollments: [
                  ...selectedStudentForDrawer.enrollments,
                  { courseId, course: { id: courseToAdd.id, title: courseToAdd.title } },
                ],
              });
            }
          }
        }
        router.refresh();
      }
    } catch {
      alert("Erro ao gerenciar matrícula.");
    }
  };

  // Course handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao criar curso");
        setLoading(false);
        return;
      }

      setShowAddCourse(false);
      setNewCourse({ title: "", description: "", thumbnailUrl: "" });
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingCourse.title,
          description: editingCourse.description,
          thumbnailUrl: editingCourse.thumbnailUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao atualizar curso");
        setLoading(false);
        return;
      }

      setEditingCourse(null);
      router.refresh();
    } catch {
      setErrorMsg("Erro de conexão ao salvar alterações do curso");
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * studentsPerPage,
    studentPage * studentsPerPage
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchCourse.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchCourse.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 bg-[#0b0d12]">
      {/* Header Superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1e2533] pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão centralizada de cursos, grade curricular, transmissões e alunos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          <Link
            href="/admin/docs"
            className="px-3.5 py-2 rounded-xl bg-[#141822] hover:bg-[#182030] text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-[#232d42] transition-all"
            title="Acessar documentação interativa da API"
          >
            <FileCode className="w-3.5 h-3.5" />
            Docs da API
          </Link>

          <button
            onClick={handleOpenTokenModal}
            className="px-3.5 py-2 rounded-xl bg-[#182030] hover:bg-[#20293d] text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-[#2e374d] transition-all shadow-sm"
            title="Gerar ou copiar token JWT de integração"
          >
            <Key className="w-3.5 h-3.5" />
            Token de API
          </button>

          <button
            onClick={() => setShowAddStudent(true)}
            className="px-3.5 py-2 rounded-xl bg-[#182030] hover:bg-[#20293d] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-[#232d42] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            Cadastrar Aluno
          </button>

          <button
            onClick={() => setShowAddCourse(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Curso
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141c] border border-[#1e2533] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#182030] text-blue-400 flex items-center justify-center border border-[#232d42] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">{stats.totalStudents}</span>
            <p className="text-xs text-slate-400 font-medium">Alunos Ativos</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141c] border border-[#1e2533] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#182030] text-blue-400 flex items-center justify-center border border-[#232d42] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">{stats.totalCourses}</span>
            <p className="text-xs text-slate-400 font-medium">Cursos Criados</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141c] border border-[#1e2533] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#182030] text-blue-400 flex items-center justify-center border border-[#232d42] shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">{stats.totalVodLessons}</span>
            <p className="text-xs text-slate-400 font-medium">Aulas VOD</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141c] border border-[#1e2533] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center border border-red-900/50 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">{stats.totalLiveLessons}</span>
            <p className="text-xs text-slate-400 font-medium">Lives Cadastradas</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1e2533] gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === "courses"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Cursos da Plataforma ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === "students"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Alunos & Matrículas ({students.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CATÁLOGO DE CURSOS (CARDS ESPAÇOSOS COM NAVEGAÇÃO MASTER-DETAIL)   */}
      {/* ========================================================================= */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                placeholder="Buscar curso por título..."
                className="w-full pl-9 pr-4 py-2 bg-[#11141c] border border-[#1e2533] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowAddCourse(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Novo Curso
            </button>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#11141c] border border-[#1e2533] text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Nenhum curso encontrado</p>
              <p className="text-xs text-slate-400">
                {searchCourse
                  ? "Tente outro termo na busca."
                  : "Crie seu primeiro curso para começar a adicionar aulas."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const totalLessons = course.modules.flatMap((m) => m.lessons).length;
                const enrollmentsCount = course._count?.enrollments || 0;

                return (
                  <div
                    key={course.id}
                    className="rounded-2xl bg-[#11141c] border border-[#1e2533] overflow-hidden flex flex-col hover:border-[#2a3447] transition-all group shadow-sm"
                  >
                    {/* Capa */}
                    <div className="relative aspect-video w-full bg-[#0b0d12] overflow-hidden border-b border-[#1e2533]">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <BookOpen className="w-10 h-10 text-blue-500" />
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                        {totalLessons} {totalLessons === 1 ? "aula" : "aulas"}
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h2 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors leading-snug">
                          {course.title}
                        </h2>
                        {course.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                      </div>

                      {/* Métricas do Card */}
                      <div className="flex items-center gap-2 pt-3 border-t border-[#1e2533] text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-blue-400" />
                          {course.modules.length} módulos
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-400" />
                          {enrollmentsCount} {enrollmentsCount === 1 ? "aluno" : "alunos"}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="space-y-2 pt-1">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          Gerenciar Conteúdo & Aulas
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setEditingCourse({
                                id: course.id,
                                title: course.title,
                                description: course.description || "",
                                thumbnailUrl: course.thumbnailUrl || "",
                              })
                            }
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#182030] hover:bg-[#20293d] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#232d42] transition-colors"
                          >
                            <Pencil className="w-3 h-3 text-blue-400" />
                            Editar Capa/Dados
                          </button>
                          <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="py-1.5 px-3 rounded-lg bg-[#182030] hover:bg-[#20293d] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-[#232d42] transition-colors"
                            title="Ver página pública do curso"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: GESTÃO DE ALUNOS COM PAGINAÇÃO E SLIDE-OVER DRAWER                 */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => {
                  setSearchStudent(e.target.value);
                  setStudentPage(1);
                }}
                placeholder="Buscar aluno por nome ou e-mail..."
                className="w-full pl-9 pr-4 py-2 bg-[#11141c] border border-[#1e2533] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {filteredStudents.length} {filteredStudents.length === 1 ? "aluno cadastrado" : "alunos cadastrados"}
              </span>
              <button
                onClick={() => setShowAddStudent(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Aluno
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2533] bg-[#11141c] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1118] border-b border-[#1e2533] text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Aluno</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Matrículas Ativas</th>
                    <th className="p-4">Cadastro</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181d28]">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-slate-500">
                        Nenhum aluno encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => {
                      const count = student.enrollments.length;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-[#141822] transition-colors group cursor-pointer"
                          onClick={() => setSelectedStudentForDrawer(student)}
                        >
                          <td className="p-4 font-semibold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#182030] text-blue-400 font-bold flex items-center justify-center text-xs border border-[#232d42] shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="group-hover:text-blue-400 transition-colors">
                              {student.name}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-mono text-[11px]">
                            {student.email}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#182030] text-blue-400 border border-[#232d42]">
                              {count} {count === 1 ? "curso" : "cursos"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {format(new Date(student.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedStudentForDrawer(student)}
                              className="px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-[#20293d] text-slate-300 hover:text-white text-xs font-semibold border border-[#232d42] transition-colors"
                            >
                              Ficha do Aluno
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="p-4 bg-[#0e1118] border-t border-[#1e2533] flex items-center justify-between text-xs text-slate-400">
                <span>
                  Página {studentPage} de {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={studentPage <= 1}
                    onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#20293d] disabled:opacity-40 text-slate-300 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={studentPage >= totalPages}
                    onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#20293d] disabled:opacity-40 text-slate-300 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: FICHA LATERAL DO ALUNO                                 */}
      {/* ========================================================================= */}
      {selectedStudentForDrawer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedStudentForDrawer(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#11141c] border-l border-[#1e2533] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1e2533]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                    {selectedStudentForDrawer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">
                      {selectedStudentForDrawer.name}
                    </h2>
                    <p className="text-xs text-slate-400">{selectedStudentForDrawer.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentForDrawer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182030] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informações Básicas */}
              <div className="p-3.5 rounded-xl bg-[#0b0d12] border border-[#1e2533] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Data de Cadastro:</span>
                  <span className="text-white font-medium">
                    {format(new Date(selectedStudentForDrawer.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cursos Ativos:</span>
                  <span className="text-blue-400 font-bold">
                    {selectedStudentForDrawer.enrollments.length}
                  </span>
                </div>
              </div>

              {/* Lista de Matrículas */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Matrículas nos Cursos da Plataforma
                </h3>
                <p className="text-[11px] text-slate-400">
                  Clique no botão ao lado do curso para conceder ou remover o acesso do aluno imediatamente.
                </p>

                <div className="space-y-2.5 pt-1">
                  {courses.map((c) => {
                    const isEnrolled = selectedStudentForDrawer.enrollments.some(
                      (e) => e.courseId === c.id
                    );

                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-[#0b0d12] border border-[#1e2533] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{c.title}</p>
                          <span
                            className={`inline-block text-[10px] font-medium mt-0.5 ${
                              isEnrolled ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            {isEnrolled ? "✓ Acesso liberado" : "✕ Sem acesso"}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            handleToggleEnrollment(selectedStudentForDrawer.id, c.id, isEnrolled)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                            isEnrolled
                              ? "bg-red-950/40 text-red-400 hover:bg-red-950/70 border border-red-900/50"
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                          }`}
                        >
                          {isEnrolled ? "Remover" : "Matricular"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e2533] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDrawer(null)}
                className="w-full py-2.5 rounded-xl bg-[#182030] hover:bg-[#20293d] text-white text-xs font-semibold border border-[#232d42] transition-colors"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 0: TOKEN DE API                                                     */}
      {/* ========================================================================= */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2533]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Chave de API (Bearer JWT)</h2>
                  <p className="text-[11px] text-slate-400">Token com permissão de administrador</p>
                </div>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Utilize este token no cabeçalho <code className="px-1.5 py-0.5 rounded bg-[#0b0d12] text-amber-300 font-mono text-[11px] border border-[#1e2533]">Authorization: Bearer &lt;token&gt;</code> para autenticar requisições via cURL, Postman, scripts ou webhooks externos.
            </p>

            {generatingToken ? (
              <div className="p-6 rounded-xl bg-[#0b0d12] border border-[#1e2533] text-center space-y-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Gerando chave criptográfica segura...</p>
              </div>
            ) : apiToken ? (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    readOnly
                    value={apiToken}
                    rows={4}
                    className="w-full p-3 font-mono text-[11px] text-slate-200 bg-[#0b0d12] border border-[#1e2533] rounded-xl focus:outline-none focus:border-blue-500 select-all resize-none leading-relaxed"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    {tokenCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Válido por 7 dias</span>
                  <button
                    onClick={handleGenerateToken}
                    className="text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    Gerar novo token
                  </button>
                </div>
              </div>
            ) : null}

            <div className="p-3 rounded-xl bg-[#0e121a] border border-[#1e2533] flex items-center justify-between">
              <span className="text-xs text-slate-400">Dúvidas sobre os endpoints?</span>
              <Link
                href="/admin/docs"
                onClick={() => setShowTokenModal(false)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Abrir Documentação da API →
              </Link>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 rounded-xl bg-[#182030] hover:bg-[#20293d] text-white text-xs font-semibold border border-[#232d42]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CADASTRAR ALUNO                                                  */}
      {/* ========================================================================= */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Cadastrar Novo Aluno</h2>

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800/60">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Nome do aluno"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="aluno@email.com"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha Provisória
                </label>
                <input
                  type="password"
                  required
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Matricular nos Cursos Imediatamente:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-[#0b0d12] rounded-xl border border-[#1e2533]">
                  {courses.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newStudent.selectedCourseIds.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewStudent((prev) => ({
                            ...prev,
                            selectedCourseIds: checked
                              ? [...prev.selectedCourseIds, c.id]
                              : prev.selectedCourseIds.filter((id) => id !== c.id),
                          }));
                        }}
                        className="rounded border-[#1e2533] bg-[#11141c] text-blue-600 focus:ring-0"
                      />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  {loading ? "Cadastrando..." : "Cadastrar Aluno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NOVO CURSO                                                       */}
      {/* ========================================================================= */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-[#1e2533] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white">Criar Novo Curso</h2>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Curso
                </label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Nome do treinamento"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Resumo do conteúdo..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <ImageUploader
                value={newCourse.thumbnailUrl}
                onChange={(url) => setNewCourse({ ...newCourse, thumbnailUrl: url })}
                label="Capa do Curso"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  {loading ? "Criando..." : "Criar Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDITAR CURSO                                                     */}
      {/* ========================================================================= */}
      {editingCourse && (
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
                  value={editingCourse.title}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, title: e.target.value })
                  }
                  placeholder="Nome do treinamento"
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, description: e.target.value })
                  }
                  placeholder="Resumo do conteúdo..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <ImageUploader
                value={editingCourse.thumbnailUrl}
                onChange={(url) =>
                  setEditingCourse({ ...editingCourse, thumbnailUrl: url })
                }
                label="Capa do Curso"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2533]">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
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
    </div>
  );
}
