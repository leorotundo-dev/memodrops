# MemoDrops Web — Admin Dashboard

Este app Next.js (App Router) é o front de administração do MemoDrops.

## Estrutura

- `app/(auth)/login` — login admin (consome `/auth/login`)
- `app/admin` — layout do painel
  - `/admin/dashboard` — visão geral (consome `/admin/metrics/daily`)
  - `/admin/drops` — lista drops (GET `/drops`)
  - `/admin/blueprints` — lista blueprints (GET `/admin/debug/blueprints`)
  - `/admin/rag` — lista blocos de RAG (GET `/admin/rag/blocks`)
  - `/admin/harvest` — lista harvest_items (GET `/admin/harvest/items`)
  - `/admin/users` — lista usuários (GET `/admin/users`, a ser implementado)

## Integração com backend

Defina no `.env` do app web:

```env
NEXT_PUBLIC_API_URL=https://seu-backend-no-railway.com
```

O helper `lib/api.ts` usa esse valor e injeta `Authorization: Bearer <token>`
a partir do `localStorage.memodrops_token`.

O login em `/login` espera que o backend responda algo como:

```json
{ "token": "jwt-aqui" }
```

e guarda esse token no `localStorage`.

## Como rodar localmente

Na pasta `apps/web`:

```bash
npm install
npm run dev
```

## Proteção das rotas admin

O componente `AdminShell`:

- Lê `localStorage.memodrops_token`
- Se não existir e a rota começar com `/admin`, redireciona para `/login`.

Você pode evoluir isso depois para um esquema mais robusto com cookies / middleware.
