"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Copy,
  Check,
  Search,
  BookOpen,
  Terminal,
  Code2,
  Lock,
  Layers,
  Video,
  Users,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface ApiDocsClientViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface EndpointDoc {
  id: string;
  category: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  title: string;
  description: string;
  authRequired: "ADMIN" | "ALUNO" | "PÚBLICO";
  headers?: Record<string, string>;
  body?: string;
  response: string;
  curlExample: string;
  jsExample: string;
}

export function ApiDocsClientView({ user }: ApiDocsClientViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [activeTabByEndpoint, setActiveTabByEndpoint] = useState<Record<string, "curl" | "js" | "payload">>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Token management
  const [apiToken, setApiToken] = useState<string>("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tokenPlaceholder = apiToken || "SEU_TOKEN_JWT_AQUI";

  const endpoints: EndpointDoc[] = [
    // 1. Autenticação
    {
      id: "auth-login",
      category: "Autenticação",
      method: "POST",
      path: "/api/auth/login",
      title: "Login & Emissão de Token",
      description: "Autentica usuário com e-mail e senha. Retorna o token JWT e salva o cookie de sessão.",
      authRequired: "PÚBLICO",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          email: "admin@lms.com",
          password: "admin123",
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          success: true,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: {
            id: "cmu...",
            name: "Administrador LMS",
            email: "admin@lms.com",
            role: "ADMIN",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@lms.com","password":"admin123"}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@lms.com', password: 'admin123' })
});
const data = await res.json();
console.log('Token:', data.token);`,
    },
    {
      id: "auth-me",
      category: "Autenticação",
      method: "GET",
      path: "/api/auth/me",
      title: "Consultar Usuário Autenticado",
      description: "Retorna os dados do usuário autenticado a partir do Bearer Token ou Cookie de sessão.",
      authRequired: "ALUNO",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
      },
      response: JSON.stringify(
        {
          user: {
            id: "cmu...",
            name: "Administrador LMS",
            email: "admin@lms.com",
            role: "ADMIN",
            createdAt: "2026-09-15T19:48:41.777Z",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X GET http://localhost:3000/api/auth/me \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`,
      jsExample: `const res = await fetch('http://localhost:3000/api/auth/me', {
  headers: { 'Authorization': 'Bearer ${tokenPlaceholder}' }
});
const { user } = await res.json();
console.log('Usuário:', user);`,
    },
    {
      id: "admin-token",
      category: "Autenticação",
      method: "POST",
      path: "/api/admin/token",
      title: "Gerar Chave de API de Administrador",
      description: "Emite um novo token JWT de longa duração para o administrador atual.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
      },
      response: JSON.stringify(
        {
          success: true,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: {
            id: "cmu...",
            name: "Administrador LMS",
            email: "admin@lms.com",
            role: "ADMIN",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/admin/token \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/token', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ${tokenPlaceholder}' }
});
const data = await res.json();
console.log('Novo Token:', data.token);`,
    },

    // 2. Cursos
    {
      id: "courses-create",
      category: "Cursos",
      method: "POST",
      path: "/api/admin/courses",
      title: "Criar Novo Curso",
      description: "Cria um curso na plataforma. O slug da URL é gerado automaticamente a partir do título.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          title: "Formação em Streaming e Nuvem",
          description: "Aprenda a arquitetar transmissões ao vivo com iframes e baixa latência.",
          thumbnailUrl: "/uploads/minha-capa.png",
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          success: true,
          course: {
            id: "cm_curso_123",
            title: "Formação em Streaming e Nuvem",
            slug: "formacao-em-streaming-e-nuvem",
            description: "Aprenda a arquitetar transmissões...",
            thumbnailUrl: "/uploads/minha-capa.png",
            isPublished: true,
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/admin/courses \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Formação em Streaming e Nuvem",
    "description": "Aprenda a arquitetar transmissões...",
    "thumbnailUrl": "/uploads/minha-capa.png"
  }'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/courses', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Formação em Streaming e Nuvem',
    description: 'Aprenda a arquitetar transmissões...',
    thumbnailUrl: '/uploads/minha-capa.png'
  })
});
const data = await res.json();`,
    },
    {
      id: "courses-update",
      category: "Cursos",
      method: "PUT",
      path: "/api/admin/courses/[id]",
      title: "Atualizar Dados e Capa do Curso",
      description: "Atualiza título, descrição e imagem de capa de um curso existente.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          title: "Formação em Streaming e Nuvem - Edição Pro",
          description: "Conteúdo 100% atualizado.",
          thumbnailUrl: "/uploads/nova-capa-2026.png",
        },
        null,
        2
      ),
      response: JSON.stringify({ success: true, course: { id: "cm_curso_123" } }, null, 2),
      curlExample: `curl -X PUT http://localhost:3000/api/admin/courses/ID_DO_CURSO \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Título Atualizado","thumbnailUrl":"/uploads/nova-capa.png"}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/courses/ID_DO_CURSO', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'Título Atualizado', thumbnailUrl: '/uploads/nova-capa.png' })
});`,
    },
    {
      id: "courses-delete",
      category: "Cursos",
      method: "DELETE",
      path: "/api/admin/courses/[id]",
      title: "Excluir Curso",
      description: "Remove um curso e suas relações da plataforma.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
      },
      response: JSON.stringify({ success: true }, null, 2),
      curlExample: `curl -X DELETE http://localhost:3000/api/admin/courses/ID_DO_CURSO \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/courses/ID_DO_CURSO', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ${tokenPlaceholder}' }
});`,
    },

    // 3. Módulos
    {
      id: "modules-create",
      category: "Módulos",
      method: "POST",
      path: "/api/admin/modules",
      title: "Criar Módulo no Curso",
      description: "Cria um módulo dentro de um curso. A ordenação é gerada automaticamente.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          title: "Módulo 1: Setup do Servidor e Streaming",
          courseId: "ID_DO_CURSO_AQUI",
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          success: true,
          module: {
            id: "cm_modulo_123",
            title: "Módulo 1: Setup do Servidor e Streaming",
            orderIndex: 1,
            courseId: "ID_DO_CURSO_AQUI",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/admin/modules \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Módulo 1: Setup","courseId":"ID_DO_CURSO"}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/modules', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'Módulo 1: Setup', courseId: 'ID_DO_CURSO' })
});`,
    },
    {
      id: "modules-update",
      category: "Módulos",
      method: "PUT",
      path: "/api/admin/modules/{id}",
      title: "Atualizar Módulo",
      description: "Atualiza o título e/ou ordenação de um módulo existente.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          title: "Módulo 1: Setup Avançado",
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          success: true,
          module: {
            id: "cm_modulo_123",
            title: "Módulo 1: Setup Avançado",
            orderIndex: 1,
            courseId: "ID_DO_CURSO_AQUI",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X PUT http://localhost:3000/api/admin/modules/cm_modulo_123 \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Módulo 1: Setup Avançado"}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/modules/cm_modulo_123', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'Módulo 1: Setup Avançado' })
});`,
    },
    {
      id: "modules-delete",
      category: "Módulos",
      method: "DELETE",
      path: "/api/admin/modules/{id}",
      title: "Excluir Módulo",
      description: "Exclui um módulo e todas as suas aulas associadas (deleção em cascata).",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
      },
      response: JSON.stringify({ success: true }, null, 2),
      curlExample: `curl -X DELETE http://localhost:3000/api/admin/modules/cm_modulo_123 \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/modules/cm_modulo_123', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}'
  }
});`,
    },

    // 4. Aulas & Lives
    {
      id: "lessons-create-vod",
      category: "Aulas & Lives",
      method: "POST",
      path: "/api/admin/lessons",
      title: "Cadastrar Aula Gravada (VOD)",
      description: "Cadastra uma aula gravada aceitando o código <iframe> completo copiado da sua plataforma de streaming.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          title: "Aula 01: Primeiros Passos com o Player",
          description: "Visão geral da interface e controles de reprodução.",
          type: "VOD",
          durationMinutes: 22,
          durationSeconds: 30,
          videoEmbedCode: '<iframe src="https://player.exemplo.com/embed/123" allowfullscreen></iframe>',
          moduleId: "ID_DO_MODULO",
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          success: true,
          lesson: {
            id: "cm_aula_123",
            title: "Aula 01: Primeiros Passos",
            type: "VOD",
            durationMinutes: 22,
            durationSeconds: 30,
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/admin/lessons \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Aula 01: Primeiros Passos",
    "type": "VOD",
    "durationMinutes": 22,
    "durationSeconds": 30,
    "videoEmbedCode": "<iframe src=\\"https://player.exemplo.com/embed/123\\"></iframe>",
    "moduleId": "ID_DO_MODULO"
  }'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/lessons', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Aula 01: Primeiros Passos',
    type: 'VOD',
    durationMinutes: 22,
    durationSeconds: 30,
    videoEmbedCode: '<iframe src="https://player.exemplo.com/embed/123"></iframe>',
    moduleId: 'ID_DO_MODULO'
  })
});`,
    },
    {
      id: "lessons-create-live",
      category: "Aulas & Lives",
      method: "POST",
      path: "/api/admin/lessons",
      title: "Agendar Transmissão ao Vivo (Live)",
      description: "Agenda uma live com iframes independentes de transmissão e chat ao vivo.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          title: "Live: Mentoria Semanal e Perguntas",
          description: "Transmissão ao vivo com chat integrado lado a lado.",
          type: "LIVE",
          liveScheduledAt: "2026-10-10T19:00:00.000Z",
          liveStatus: "SCHEDULED",
          videoEmbedCode: '<iframe src="https://player.exemplo.com/live/123"></iframe>',
          chatEmbedCode: '<iframe src="https://player.exemplo.com/chat/123"></iframe>',
          moduleId: "ID_DO_MODULO",
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          success: true,
          lesson: {
            id: "cm_live_123",
            title: "Live: Mentoria Semanal",
            type: "LIVE",
            liveStatus: "SCHEDULED",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/admin/lessons \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Live: Mentoria",
    "type": "LIVE",
    "liveScheduledAt": "2026-10-10T19:00:00.000Z",
    "liveStatus": "SCHEDULED",
    "videoEmbedCode": "<iframe src=\\"https://player.exemplo.com/live/123\\"></iframe>",
    "chatEmbedCode": "<iframe src=\\"https://player.exemplo.com/chat/123\\"></iframe>",
    "moduleId": "ID_DO_MODULO"
  }'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/lessons', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Live: Mentoria',
    type: 'LIVE',
    liveScheduledAt: '2026-10-10T19:00:00.000Z',
    liveStatus: 'SCHEDULED',
    videoEmbedCode: '<iframe src="https://player.exemplo.com/live/123"></iframe>',
    chatEmbedCode: '<iframe src="https://player.exemplo.com/chat/123"></iframe>',
    moduleId: 'ID_DO_MODULO'
  })
});`,
    },
    {
      id: "lessons-update",
      category: "Aulas & Lives",
      method: "PUT",
      path: "/api/admin/lessons/[id]",
      title: "Editar Aula ou Transmissão",
      description: "Permite mudar o status da live para 'LIVE' (ao vivo) ou 'ENDED' (encerrada), trocar iframes ou atualizar descrições.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          liveStatus: "LIVE",
        },
        null,
        2
      ),
      response: JSON.stringify({ success: true, lesson: { id: "cm_live_123", liveStatus: "LIVE" } }, null, 2),
      curlExample: `curl -X PUT http://localhost:3000/api/admin/lessons/ID_DA_AULA \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"liveStatus":"LIVE"}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/lessons/ID_DA_AULA', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ liveStatus: 'LIVE' })
});`,
    },

    // 5. Alunos & Matrículas
    {
      id: "users-list",
      category: "Alunos & Matrículas",
      method: "GET",
      path: "/api/admin/users",
      title: "Listar Alunos & Matrículas",
      description: "Retorna a listagem de todos os alunos cadastrados e os cursos em que estão inscritos.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
      },
      response: JSON.stringify(
        {
          users: [
            {
              id: "cm_aluno_1",
              name: "Aluno Demonstração",
              email: "aluno@lms.com",
              createdAt: "2026-09-15T19:48:42.000Z",
              enrollments: [
                {
                  course: { id: "cm_curso_1", title: "Masterclass" },
                },
              ],
            },
          ],
        },
        null,
        2
      ),
      curlExample: `curl -X GET http://localhost:3000/api/admin/users \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/users', {
  headers: { 'Authorization': 'Bearer ${tokenPlaceholder}' }
});
const { users } = await res.json();`,
    },
    {
      id: "users-create",
      category: "Alunos & Matrículas",
      method: "POST",
      path: "/api/admin/users",
      title: "Cadastrar Novo Aluno",
      description: "Cadastra aluno com senha temporária e opcionalmente já o matricula em cursos.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          name: "Carlos Eduardo",
          email: "carlos@exemplo.com",
          password: "senhaSegura123",
          courseIds: ["ID_CURSO_1", "ID_CURSO_2"],
        },
        null,
        2
      ),
      response: JSON.stringify({ success: true, user: { id: "cm_novo_aluno" } }, null, 2),
      curlExample: `curl -X POST http://localhost:3000/api/admin/users \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Carlos","email":"carlos@exemplo.com","password":"senha123","courseIds":["ID_CURSO"]}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Carlos',
    email: 'carlos@exemplo.com',
    password: 'senha123',
    courseIds: ['ID_CURSO']
  })
});`,
    },
    {
      id: "enrollments-manage",
      category: "Alunos & Matrículas",
      method: "POST",
      path: "/api/admin/enrollments",
      title: "Matricular ou Desmatricular Aluno",
      description: "Gerencia a matrícula de um aluno em um curso específico (ações 'ENROLL' ou 'UNENROLL').",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          userId: "ID_DO_ALUNO",
          courseId: "ID_DO_CURSO",
          action: "ENROLL",
        },
        null,
        2
      ),
      response: JSON.stringify({ success: true, message: "Matrícula realizada com sucesso." }, null, 2),
      curlExample: `curl -X POST http://localhost:3000/api/admin/enrollments \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"userId":"ID_DO_ALUNO","courseId":"ID_DO_CURSO","action":"ENROLL"}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/admin/enrollments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'ID_DO_ALUNO',
    courseId: 'ID_DO_CURSO',
    action: 'ENROLL'
  })
});`,
    },

    // 6. Upload de Mídia
    {
      id: "media-upload",
      category: "Upload de Mídia",
      method: "POST",
      path: "/api/upload",
      title: "Upload Local de Imagem",
      description: "Envia arquivos de imagem (PNG, JPG, WebP, GIF) do computador para salvar no servidor local.",
      authRequired: "ADMIN",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "multipart/form-data",
      },
      body: "FormData: 'file': [Arquivo Binário da Imagem]",
      response: JSON.stringify(
        {
          success: true,
          url: "/uploads/capa-curso-1757960000000.png",
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/upload \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -F "file=@/caminho/para/imagem.png"`,
      jsExample: `const formData = new FormData();
formData.append('file', fileInput.files[0]);

const res = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ${tokenPlaceholder}' },
  body: formData
});
const { url } = await res.json();
console.log('URL da Imagem:', url);`,
    },

    // 7. Progresso
    {
      id: "progress-toggle",
      category: "Progresso",
      method: "POST",
      path: "/api/lessons/[lessonId]/progress",
      title: "Marcar / Desmarcar Aula Concluída",
      description: "Salva o progresso do aluno na aula atual.",
      authRequired: "ALUNO",
      headers: {
        Authorization: `Bearer ${tokenPlaceholder}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isCompleted: true }, null, 2),
      response: JSON.stringify(
        {
          success: true,
          progress: {
            id: "cm_prog_1",
            isCompleted: true,
            completedAt: "2026-09-15T19:50:00.000Z",
          },
        },
        null,
        2
      ),
      curlExample: `curl -X POST http://localhost:3000/api/lessons/ID_DA_AULA/progress \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{"isCompleted":true}'`,
      jsExample: `const res = await fetch('http://localhost:3000/api/lessons/ID_DA_AULA/progress', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${tokenPlaceholder}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ isCompleted: true })
});`,
    },
  ];

  const categories = ["TODOS", "Autenticação", "Cursos", "Módulos", "Aulas & Lives", "Alunos & Matrículas", "Upload de Mídia", "Progresso"];

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesCategory = selectedCategory === "TODOS" || ep.category === selectedCategory;
    const matchesSearch =
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "POST":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "PUT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      {/* Header */}
      <div className="border-b border-[#1e2533] bg-[#0e1118]/80 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-[#141822] hover:bg-[#1b202e] text-slate-300 hover:text-white border border-[#1e2533] transition-colors"
              title="Voltar ao Painel Admin"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Documentação da API REST
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Referência técnica completa de endpoints, autenticação JWT e integrações.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateToken}
              disabled={generatingToken}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30 transition-all shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              {generatingToken ? "Gerando..." : apiToken ? "Atualizar Token" : "Gerar Token para Testes"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Token Banner Interativo */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#11141c] border border-[#1e2533] space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2533]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Chave de Autenticação Ativa para Testes</h2>
                <p className="text-xs text-slate-400">
                  {apiToken
                    ? "Este token foi injetado automaticamente em todos os exemplos de cURL e código abaixo."
                    : "Gere seu token de administrador com um clique para testar as requisições imediatamente."}
                </p>
              </div>
            </div>

            {!apiToken && (
              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                {generatingToken ? "Gerando Token..." : "Gerar Meu Token de API"}
              </button>
            )}
          </div>

          {apiToken && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  readOnly
                  value={apiToken}
                  className="w-full pl-3 pr-24 py-2.5 font-mono text-xs text-amber-300 bg-[#0b0d12] border border-[#1e2533] rounded-xl focus:outline-none select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiToken);
                    setTokenCopied(true);
                    setTimeout(() => setTokenCopied(false), 2000);
                  }}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-[#20293d] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-[#2e374d] transition-all"
                >
                  {tokenCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Token ativo e pronto para uso
                </span>
                <span>Válido por 7 dias</span>
              </div>
            </div>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por endpoint, método ou descrição..."
                className="w-full pl-9 pr-4 py-2 bg-[#11141c] border border-[#1e2533] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {filteredEndpoints.length} {filteredEndpoints.length === 1 ? "endpoint" : "endpoints"} encontrados
            </span>
          </div>

          {/* Categories bar */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[#11141c] hover:bg-[#182030] text-slate-300 border border-[#1e2533]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-6">
          {filteredEndpoints.map((ep) => {
            const activeTab = activeTabByEndpoint[ep.id] || "curl";

            return (
              <div
                key={ep.id}
                id={ep.id}
                className="rounded-2xl bg-[#11141c] border border-[#1e2533] overflow-hidden shadow-sm hover:border-[#2a3447] transition-all"
              >
                {/* Endpoint Header */}
                <div className="p-4 sm:p-5 bg-[#141822] border-b border-[#1e2533] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-extrabold border uppercase tracking-wider ${getMethodBadgeClass(
                        ep.method
                      )}`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-white">
                      {ep.path}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1b2230] text-slate-300 border border-[#2a3447]">
                      {ep.authRequired}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">{ep.category}</span>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white">{ep.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ep.description}</p>
                  </div>

                  {/* Headers Table */}
                  {ep.headers && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Cabeçalhos Obrigatórios (Headers)
                      </span>
                      <div className="rounded-xl border border-[#1e2533] bg-[#0b0d12] overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <tbody className="divide-y divide-[#1e2533]">
                            {Object.entries(ep.headers).map(([key, val]) => (
                              <tr key={key} className="p-2">
                                <td className="p-2.5 font-mono text-blue-400 font-semibold text-[11px] w-1/3">
                                  {key}
                                </td>
                                <td className="p-2.5 font-mono text-slate-300 text-[11px] truncate max-w-xs sm:max-w-md">
                                  {val}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Code Switcher */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1e2533] pb-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setActiveTabByEndpoint((prev) => ({ ...prev, [ep.id]: "curl" }))
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            activeTab === "curl"
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          cURL (Terminal)
                        </button>
                        <button
                          onClick={() =>
                            setActiveTabByEndpoint((prev) => ({ ...prev, [ep.id]: "js" }))
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            activeTab === "js"
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          JavaScript / Fetch
                        </button>
                        {ep.body && (
                          <button
                            onClick={() =>
                              setActiveTabByEndpoint((prev) => ({ ...prev, [ep.id]: "payload" }))
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              activeTab === "payload"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Request Body (JSON)
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const textToCopy =
                            activeTab === "curl"
                              ? ep.curlExample
                              : activeTab === "js"
                              ? ep.jsExample
                              : ep.body || "";
                          copyToClipboard(textToCopy, `${ep.id}-${activeTab}`);
                        }}
                        className="px-2.5 py-1 rounded-md bg-[#182030] hover:bg-[#20293d] text-slate-300 text-xs font-semibold flex items-center gap-1 border border-[#232d42] transition-colors"
                      >
                        {copiedId === `${ep.id}-${activeTab}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-blue-400" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Code Container */}
                    <div className="relative rounded-xl bg-[#0b0d12] border border-[#1e2533] p-4 overflow-x-auto">
                      <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                        {activeTab === "curl" && ep.curlExample}
                        {activeTab === "js" && ep.jsExample}
                        {activeTab === "payload" && ep.body}
                      </pre>
                    </div>
                  </div>

                  {/* Expected Response */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Resposta Esperada (200 OK / 201 Created)
                    </span>
                    <div className="rounded-xl bg-[#0e1118] border border-[#1e2533] p-3 overflow-x-auto">
                      <pre className="font-mono text-[11px] text-emerald-400 leading-relaxed">
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
