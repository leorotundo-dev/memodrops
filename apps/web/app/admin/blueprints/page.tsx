"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface Blueprint {
  id: number;
  disciplina?: string;
  created_at?: string;
}

export default function BlueprintsPage() {
  const [items, setItems] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/admin/debug/blueprints");
        setItems(data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar blueprints:", e);
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
          Estruturas de provas e disciplinas extraídas por IA.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && (
        <Table headers={["ID", "Disciplina", "Criado em"]}>
          {items.map(bp => (
            <tr key={bp.id}>
              <td className="px-3 py-2 text-xs text-zinc-300">{bp.id}</td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                {bp.disciplina ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {bp.created_at
                  ? new Date(bp.created_at).toLocaleString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
