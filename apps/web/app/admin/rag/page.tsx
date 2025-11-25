"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface RagBlock {
  id: number;
  disciplina: string;
  topicCode: string;
  sourceUrl: string;
  createdAt?: string;
}

export default function RagPage() {
  const [items, setItems] = useState<RagBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // ponto de partida - ajuste conforme sua rota real
        const data = await apiGet("/admin/rag/blocks?disciplina=Geral&topicCode=*");
        setItems(data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar RAG blocks:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">RAG Blocks</h1>
        <p className="text-sm text-zinc-400">
          Blocos de conhecimento externos usados como contexto.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && (
        <Table headers={["ID", "Disciplina", "Tópico", "Fonte", "Criado em"]}>
          {items.map(b => (
            <tr key={b.id}>
              <td className="px-3 py-2 text-xs text-zinc-300">{b.id}</td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                {b.disciplina}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {b.topicCode}
              </td>
              <td className="px-3 py-2 text-xs text-blue-400 underline">
                <a href={b.sourceUrl} target="_blank">
                  Fonte
                </a>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {b.createdAt
                  ? new Date(b.createdAt).toLocaleString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
