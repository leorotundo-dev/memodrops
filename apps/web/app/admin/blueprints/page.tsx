"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { mockBlueprints } from "../../../lib/mockData";
import { Table } from "../../../components/ui/Table";

interface Blueprint {
  id: string | number;
  name?: string;
  disciplina?: string;
  topicCode?: string;
  created_at?: string;
  updated_at?: string;
}

export default function BlueprintsPage() {
  const [items, setItems] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet("/admin/debug/blueprints");
        setItems(data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar blueprints:", e);
        // Usar dados mock como fallback
        setItems(mockBlueprints.blueprints);
        if (mockBlueprints.blueprints.length === 0) {
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Blueprints</h1>
        <p className="text-sm text-zinc-400">
          Modelos de questões e estruturas de aprendizado.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {error && (
        <div className="rounded-lg bg-red-950/40 border border-red-900 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="rounded-lg bg-zinc-900/40 border border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-400">Nenhum blueprint encontrado</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <Table
          headers={[
            "ID",
            "Nome",
            "Disciplina",
            "Tópico",
            "Criado em",
            "Atualizado em"
          ]}
        >
          {items.map(bp => (
            <tr key={bp.id}>
              <td className="px-3 py-2 text-xs text-zinc-300 font-mono">
                {typeof bp.id === "string" ? bp.id.substring(0, 8) : bp.id}...
              </td>
              <td className="px-3 py-2 text-xs text-zinc-50">{bp.name}</td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {bp.disciplina ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {bp.topicCode ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-500">
                {bp.created_at
                  ? new Date(bp.created_at).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-500">
                {bp.updated_at
                  ? new Date(bp.updated_at).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
