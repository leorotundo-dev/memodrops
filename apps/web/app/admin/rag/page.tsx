"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface RagBlock {
  id: string | number;
  disciplina?: string;
  topicCode?: string;
  sourceUrl?: string;
  title?: string;
  content?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
}

export default function RagPage() {
  const [items, setItems] = useState<RagBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/admin/rag/blocks");
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

      {!loading && items.length === 0 && (
        <div className="rounded-lg bg-zinc-900/40 border border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-400">Nenhum RAG block encontrado</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <Table headers={["ID", "Título", "Tipo", "Status", "Criado em", "Atualizado em"]}>
          {items.map(b => (
            <tr key={b.id} className="hover:bg-zinc-800/40 cursor-pointer transition-colors">
              <td className="px-3 py-2 text-xs text-zinc-300 font-mono">
                <Link
                  href={`/admin/rag/${b.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {typeof b.id === "string" ? b.id.substring(0, 8) : b.id}...
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                <Link
                  href={`/admin/rag/${b.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {b.title || b.disciplina || "Sem título"}
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {b.type ?? b.topicCode ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                <span className="capitalize">{b.status ?? "-"}</span>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-500">
                {(b.created_at || b.createdAt)
                  ? new Date(b.created_at || b.createdAt || "").toLocaleDateString("pt-BR")
                  : "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-500">
                {b.updated_at
                  ? new Date(b.updated_at).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
