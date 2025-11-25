export const dynamic = 'force-dynamic';

import { apiGet } from "../../../../lib/api";

interface HarvestDetail {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  items_count?: number;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

async function getHarvestDetail(id: string): Promise<HarvestDetail | null> {
  try {
    const data = await apiGet(`/admin/harvest/items/${id}`);
    return data;
  } catch (e) {
    console.error("Erro ao buscar harvest:", e);
    return null;
  }
}

export default async function HarvestDetailPage({ params }: { params: { id: string } }) {
  const harvest = await getHarvestDetail(params.id);

  if (!harvest) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Harvest não encontrado</h1>
        <p className="text-sm text-zinc-400">O harvest que você está procurando não existe ou foi removido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{harvest.title}</h1>
        <p className="text-sm text-zinc-400">{harvest.description}</p>
      </div>

      {/* Status e Progresso */}
      <div className="grid gap-4 md:grid-cols-3">
        {harvest.status && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Status</p>
            <p className="text-lg font-bold text-white capitalize">{harvest.status}</p>
          </div>
        )}
        {harvest.progress !== undefined && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Progresso</p>
            <div className="w-full bg-zinc-700/40 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${harvest.progress}%` }}
              />
            </div>
            <p className="text-sm font-bold text-white mt-2">{harvest.progress}%</p>
          </div>
        )}
        {harvest.items_count !== undefined && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Total de Itens</p>
            <p className="text-2xl font-bold text-white">{harvest.items_count}</p>
          </div>
        )}
      </div>

      {/* Datas */}
      <div className="grid gap-4 md:grid-cols-2">
        {harvest.created_at && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Criado em</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(harvest.created_at).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        )}
        {harvest.updated_at && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Atualizado em</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(harvest.updated_at).toLocaleDateString("pt-BR", {
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
      {harvest.metadata && Object.keys(harvest.metadata).length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Metadados</h2>
          <pre className="text-xs text-zinc-400 overflow-auto max-h-64 bg-zinc-900/40 p-4 rounded">
            {JSON.stringify(harvest.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* ID */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs text-zinc-500 mb-1">ID</p>
        <p className="text-xs text-zinc-400 font-mono break-all">{harvest.id}</p>
      </div>
    </div>
  );
}
