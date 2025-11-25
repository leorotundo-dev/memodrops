"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "../../../../lib/api";

interface BlueprintDetail {
  id: string;
  name: string;
  disciplina?: string;
  topicCode?: string;
  description?: string;
  structure?: Record<string, any>;
  questions?: Array<{
    id: string;
    text: string;
    type: string;
    options?: string[];
  }>;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export default function BlueprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blueprintId = params.id as string;

  const [blueprint, setBlueprint] = useState<BlueprintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet(`/admin/debug/blueprints/${blueprintId}`);
        setBlueprint(data);
      } catch (e) {
        console.error("Erro ao buscar blueprint:", e);
        setError("Erro ao carregar detalhes do blueprint");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [blueprintId]);

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

  if (error || !blueprint) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Voltar
        </button>
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">{error || "Blueprint não encontrado"}</p>
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
        <h1 className="text-3xl font-bold text-white mb-2">{blueprint.name}</h1>
        <p className="text-sm text-zinc-400">{blueprint.description}</p>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blueprint.disciplina && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Disciplina</p>
            <p className="text-sm font-medium text-zinc-300">
              {blueprint.disciplina}
            </p>
          </div>
        )}
        {blueprint.topicCode && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Tópico</p>
            <p className="text-sm font-medium text-zinc-300">
              {blueprint.topicCode}
            </p>
          </div>
        )}
        {blueprint.created_at && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Criado em</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(blueprint.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      {/* Estrutura */}
      {blueprint.structure && Object.keys(blueprint.structure).length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Estrutura</h2>
          <pre className="text-xs text-zinc-400 overflow-auto max-h-64 bg-zinc-900/40 p-4 rounded">
            {JSON.stringify(blueprint.structure, null, 2)}
          </pre>
        </div>
      )}

      {/* Questões */}
      {blueprint.questions && blueprint.questions.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Questões ({blueprint.questions.length})
          </h2>
          <div className="space-y-4">
            {blueprint.questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-lg border border-zinc-700 bg-zinc-800/40 p-4"
              >
                <p className="text-sm font-medium text-white mb-2">
                  {idx + 1}. {q.text}
                </p>
                <p className="text-xs text-zinc-500">Tipo: {q.type}</p>
                {q.options && q.options.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt, optIdx) => (
                      <p key={optIdx} className="text-xs text-zinc-400 p-2 bg-zinc-700/40 rounded">
                        {String.fromCharCode(65 + optIdx)}) {opt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadados */}
      {blueprint.metadata && Object.keys(blueprint.metadata).length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Metadados</h2>
          <pre className="text-xs text-zinc-400 overflow-auto max-h-64 bg-zinc-900/40 p-4 rounded">
            {JSON.stringify(blueprint.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* ID */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs text-zinc-500 mb-1">ID</p>
        <p className="text-xs text-zinc-400 font-mono break-all">{blueprint.id}</p>
      </div>
    </div>
  );
}
