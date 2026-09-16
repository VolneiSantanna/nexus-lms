# 📡 Documentação da API — Nexus LMS

A plataforma Nexus LMS disponibiliza uma API RESTful completa desenvolvida com rotas do **Next.js App Router**.

---

## 🔐 Autenticação (Modelo Híbrido)

A API suporta autenticação através de **duas formas simultâneas**:

### 1. Cabeçalho `Authorization: Bearer <token>` (Recomendado para APIs, mobile e integrações)
Passe o token JWT retornado no login dentro do cabeçalho de cada requisição:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Cookie HTTP-Only `lms_session` (Navegador Web)
Gravado automaticamente no navegador pelo endpoint `POST /api/auth/login`. Permite que requisições feitas a partir do mesmo domínio autentiquem de forma transparente e segura contra ataques XSS.

---

## 📑 Índice de Endpoints

- [1. Autenticação](#1-autenticação)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [POST /api/auth/logout](#post-apiauthlogout)
  - [GET /api/auth/me](#get-apiauthme)
  - [POST /api/admin/token](#post-apiadmintoken)
- [2. Aluno & Progresso](#2-aluno--progresso)
  - [POST /api/lessons/{lessonId}/progress](#post-apilessonslessonidprogress)
- [3. Upload de Mídia](#3-upload-de-mídia)
  - [POST /api/upload](#post-apiupload)
- [4. Gestão de Cursos (Admin)](#4-gestão-de-cursos-admin)
  - [POST /api/admin/courses](#post-apiadmincourses)
  - [PUT /api/admin/courses/{id}](#put-apiadmincoursesid)
  - [DELETE /api/admin/courses/{id}](#delete-apiadmincoursesid)
- [5. Gestão de Módulos (Admin)](#5-gestão-de-módulos-admin)
  - [POST /api/admin/modules](#post-apiadminmodules)
  - [PUT /api/admin/modules/{id}](#put-apiadminmodulesid)
  - [DELETE /api/admin/modules/{id}](#delete-apiadminmodulesid)
- [6. Gestão de Aulas & Lives (Admin)](#6-gestão-de-aulas--lives-admin)
  - [POST /api/admin/lessons](#post-apiadminlessons)
  - [PUT /api/admin/lessons/{id}](#put-apiadminlessonsid)
  - [DELETE /api/admin/lessons/{id}](#delete-apiadminlessonsid)
- [7. Alunos & Matrículas (Admin)](#7-alunos--matrículas-admin)
  - [GET /api/admin/users](#get-apiadminusers)
  - [POST /api/admin/users](#post-apiadminusers)
  - [POST /api/admin/enrollments](#post-apiadminenrollments)

---

## 1. Autenticação

### `POST /api/auth/login`
Autentica o usuário com e-mail e senha. Retorna o token JWT e os dados do usuário, além de definir o cookie de sessão.

* **Acesso:** Público
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "email": "admin@lms.com",
  "password": "admin123"
}
```
* **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm...abc",
    "name": "Administrador",
    "email": "admin@lms.com",
    "role": "ADMIN"
  }
}
```
* **Respostas de Erro:**
  - `400 Bad Request`: Dados obrigatórios ausentes.
  - `401 Unauthorized`: E-mail ou senha incorretos.

---

### `POST /api/auth/logout`
Encerra a sessão ativa e invalida o cookie do navegador.

* **Acesso:** Autenticado
* **Resposta (200 OK):** `{ "success": true }`

---

### `GET /api/auth/me`
Retorna as informações do usuário autenticado a partir do Bearer token ou cookie.

* **Acesso:** Autenticado
* **Headers:** `Authorization: Bearer <token>`
* **Resposta (200 OK):**
```json
{
  "user": {
    "id": "cm...abc",
    "name": "Administrador",
    "email": "admin@lms.com",
    "role": "ADMIN",
    "createdAt": "2026-09-15T18:00:00.000Z"
  }
}
```
* **Resposta de Erro (401 Unauthorized):** `{ "user": null }`

---

### `POST /api/admin/token`
Gera um novo Bearer JWT Token de longa duração (30 dias) para uso em ferramentas de API, automações e integrações externas.

* **Acesso:** Exclusivo para Administrador (`ADMIN`)
* **Autenticação:** Cookie de sessão de Admin ativo ou Bearer Token
* **Headers:** `Content-Type: application/json`
* **Resposta de Sucesso (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d",
  "generatedAt": "2026-09-15T18:30:00.000Z"
}
```
* **Respostas de Erro:**
  - `401 Unauthorized`: Sessão inválida ou não autenticada.
  - `403 Forbidden`: Usuário não possui papel de administrador.

---

## 2. Aluno & Progresso

### `POST /api/lessons/{lessonId}/progress`
Marca ou desmarca uma aula como concluída para o usuário autenticado.

* **Acesso:** Aluno ou Admin autenticado
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "isCompleted": true
}
```
* **Resposta (200 OK):**
```json
{
  "success": true,
  "progress": {
    "id": "cm...prog",
    "userId": "cm...usr",
    "lessonId": "cm...les",
    "isCompleted": true,
    "completedAt": "2026-09-15T18:10:00.000Z"
  }
}
```

---

## 3. Upload de Mídia

### `POST /api/upload`
Faz upload de uma imagem do computador e a salva na pasta `public/uploads/` do servidor.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`
* **Content-Type:** `multipart/form-data`
* **Form-Data:** `file`: arquivo binário (`image/png`, `image/jpeg`, `image/webp`, `image/gif`)
* **Resposta (200 OK):**
```json
{
  "success": true,
  "url": "/uploads/nome-arquivo-1757960000000.png"
}
```

---

## 4. Gestão de Cursos (Admin)

### `POST /api/admin/courses`
Cria um novo treinamento na plataforma.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "title": "Arquitetura de Software e Streaming",
  "description": "Curso completo sobre infraestrutura e iframes.",
  "thumbnailUrl": "/uploads/capa-curso.png"
}
```
* **Resposta (201 Created):** Retorna o objeto do curso criado com `id` e `slug` gerados.

---

### `PUT /api/admin/courses/{id}`
Atualiza as informações e/ou capa de um curso existente.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "title": "Arquitetura de Software e Streaming - Edição Pro",
  "description": "Nova descrição atualizada.",
  "thumbnailUrl": "/uploads/nova-capa.png"
}
```
* **Resposta (200 OK):** `{ "success": true, "course": { ... } }`

---

### `DELETE /api/admin/courses/{id}`
Exclui um curso e suas relações.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`
* **Resposta (200 OK):** `{ "success": true }`

---

## 5. Gestão de Módulos (Admin)

### `POST /api/admin/modules`
Cria um módulo dentro de um curso existente.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "title": "Módulo 1: Fundamentos de WebRTC e HLS",
  "courseId": "ID_DO_CURSO"
}
```
* **Resposta (201 Created):** Retorna o módulo com `orderIndex` calculado automaticamente.

---

### `PUT /api/admin/modules/{id}`
Atualiza o título e/ou a ordem de um módulo.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "title": "Módulo 1: Introdução Atualizada"
}
```
* **Resposta (200 OK):** Retorna o módulo atualizado.

---

### `DELETE /api/admin/modules/{id}`
Exclui um módulo e todas as suas aulas associadas (deleção em cascata).

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`
* **Resposta (200 OK):** `{ "success": true }`

---

## 6. Gestão de Aulas & Lives (Admin)

### `POST /api/admin/lessons`
Cria uma nova aula gravada (VOD) ou transmissão ao vivo (LIVE) com iframes de vídeo e chat.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Exemplo de Payload VOD:
```json
{
  "title": "Aula 01: Setup do Ambiente de Reprodução",
  "description": "Instalação e configuração inicial.",
  "type": "VOD",
  "durationMinutes": 20,
  "videoEmbedCode": "<iframe src=\"https://player.seu-servidor.com/embed/123\" allowfullscreen></iframe>",
  "moduleId": "ID_DO_MODULO"
}
```

#### Exemplo de Payload LIVE:
```json
{
  "title": "Live: Mentoria Semanal e Resolução de Dúvidas",
  "description": "Transmissão ao vivo com chat integrado.",
  "type": "LIVE",
  "liveScheduledAt": "2026-10-10T19:30:00.000Z",
  "liveStatus": "SCHEDULED",
  "videoEmbedCode": "<iframe src=\"https://player.seu-servidor.com/live/123\"></iframe>",
  "chatEmbedCode": "<iframe src=\"https://player.seu-servidor.com/chat/123\"></iframe>",
  "moduleId": "ID_DO_MODULO"
}
```

---

### `PUT /api/admin/lessons/{id}`
Atualiza dados, iframes, status de live ou duração de uma aula.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "title": "Live de Abertura (Gravada)",
  "type": "LIVE",
  "liveStatus": "ENDED",
  "videoEmbedCode": "<iframe src=\"https://player.seu-servidor.com/vod/live-gravada\"></iframe>"
}
```
* **Resposta (200 OK):** `{ "success": true, "lesson": { ... } }`

---

### `DELETE /api/admin/lessons/{id}`
Remove a aula do módulo.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`
* **Resposta (200 OK):** `{ "success": true }`

---

## 7. Alunos & Matrículas (Admin)

### `GET /api/admin/users`
Lista todos os alunos cadastrados na plataforma e seus respectivos cursos.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`
* **Resposta (200 OK):**
```json
{
  "users": [
    {
      "id": "cm...aluno",
      "name": "Aluno Demonstração",
      "email": "aluno@lms.com",
      "createdAt": "2026-09-15T18:00:00.000Z",
      "enrollments": [
        {
          "course": { "id": "cm...curso", "title": "Masterclass" }
        }
      ]
    }
  ]
}
```

---

### `POST /api/admin/users`
Cadastra um novo aluno e opcionalmente já o matricula em cursos.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body:**
```json
{
  "name": "Lucas Pereira",
  "email": "lucas@exemplo.com",
  "password": "senhaTemporaria123",
  "courseIds": ["ID_DO_CURSO_1", "ID_DO_CURSO_2"]
}
```
* **Resposta (201 Created):** `{ "success": true, "user": { ... } }`

---

### `POST /api/admin/enrollments`
Matricula ou cancela a matrícula de um aluno em um curso.

* **Acesso:** Apenas Administrador
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body para Matricular:**
```json
{
  "userId": "ID_DO_ALUNO",
  "courseId": "ID_DO_CURSO",
  "action": "ENROLL"
}
```
* **Body para Desmatricular:**
```json
{
  "userId": "ID_DO_ALUNO",
  "courseId": "ID_DO_CURSO",
  "action": "UNENROLL"
}
```

---

## 💻 Exemplos de Código de Integração

### Exemplo cURL (Autenticação Bearer)
```bash
# 1. Obter Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Consultar Meus Dados via Bearer Token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Criar Novo Curso com Bearer Token
curl -X POST http://localhost:3000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Criado via Token",
    "description": "Demonstração de autenticação Bearer JWT",
    "thumbnailUrl": ""
  }'
```

### Exemplo JavaScript / TypeScript
```typescript
async function criarAula(token: string, moduleId: string) {
  const response = await fetch('http://localhost:3000/api/admin/lessons', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Aula de Integração Externa',
      description: 'Criada automaticamente via script',
      type: 'VOD',
      durationMinutes: 15,
      videoEmbedCode: '<iframe src="https://meu-player.com/embed/aula"></iframe>',
      moduleId: moduleId
    })
  });

  return await response.json();
}
```
