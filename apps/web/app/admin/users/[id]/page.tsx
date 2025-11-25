"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "../../../../lib/api";

interface UserDetail {
  id: string;
  name?: string;
  email: string;
  plan?: string;
  status?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  drops_created?: number;
  reviews_count?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  last_login?: string;
  dropsCompleted?: number;
  dropsInProgress?: number;
  averageScore?: number;
  totalReviews?: number;
  metadata?: Record<string, any>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet(`/admin/users/${userId}`);
        setUser(data);
      } catch (e) {
        console.error("Erro ao buscar usuário:", e);
        setError("Erro ao carregar detalhes do usuário");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Voltar
        </button>
        <p className="text-sm text-zinc-400">Carregando...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Voltar
        </button>
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">{error || "Usuário não encontrado"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300 mb-4"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-4">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full bg-zinc-700"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{user.name || user.email}</h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Status, Plano e Role */}
      <div className="grid gap-4 md:grid-cols-3">
        {user.plan && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Plano</p>
            <p className="text-lg font-bold text-white capitalize">{user.plan}</p>
          </div>
        )}
        {user.status && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Status</p>
            <p className="text-lg font-bold text-white capitalize">{user.status}</p>
          </div>
        )}
        {user.role && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Função</p>
            <p className="text-lg font-bold text-white capitalize">{user.role}</p>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(user.dropsCompleted !== undefined || user.drops_created !== undefined) && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Drops Criados</p>
            <p className="text-2xl font-bold text-white">{user.drops_created ?? user.dropsCompleted ?? 0}</p>
          </div>
        )}
        {user.dropsInProgress !== undefined && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Em Progresso</p>
            <p className="text-2xl font-bold text-white">{user.dropsInProgress}</p>
          </div>
        )}
        {user.averageScore !== undefined && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Nota Média</p>
            <p className="text-2xl font-bold text-white">
              {user.averageScore.toFixed(1)}
            </p>
          </div>
        )}
        {(user.totalReviews !== undefined || user.reviews_count !== undefined) && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Avaliações</p>
            <p className="text-2xl font-bold text-white">{user.reviews_count ?? user.totalReviews ?? 0}</p>
          </div>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Sobre</h2>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{user.bio}</p>
        </div>
      )}

      {/* Datas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(user.createdAt || user.created_at) && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Membro desde</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(user.created_at || user.createdAt || "").toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        )}
        {(user.updatedAt || user.updated_at) && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Atualizado em</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(user.updated_at || user.updatedAt || "").toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        )}
        {user.last_login && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Ultimo Acesso</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(user.last_login).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        )}
      </div>

      {/* Metadados */}
      {user.metadata && Object.keys(user.metadata).length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Metadados</h2>
          <pre className="text-xs text-zinc-400 overflow-auto max-h-64 bg-zinc-900/40 p-4 rounded">
            {JSON.stringify(user.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* ID */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs text-zinc-500 mb-1">ID</p>
        <p className="text-xs text-zinc-400 font-mono break-all">{user.id}</p>
      </div>
    </div>
  );
}
