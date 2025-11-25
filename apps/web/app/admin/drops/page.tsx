"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface Drop {
  id: string | number;
  discipline_id?: string | number;
  topic_code?: string;
  title?: string;
  difficulty?: number;
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet("/drops");
        setDrops(data?.drops ?? data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar drops:", e);
        setError("Erro ao carregar drops");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Drops</h1>
        <p className="text-sm text-zinc-400">
          Lista de drops disponíveis no sistema.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && drops.length === 0 && !error && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          <p className="text-sm text-zinc-400">Nenhum drop encontrado</p>
        </div>
      )}

      {!loading && drops.length > 0 && (
        <Table headers={["ID", "Disciplina", "Tópico", "Título", "Dificuldade"]}>
          {drops.map(drop => (
            <tr
              key={drop.id}
              className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
            >
              <td className="px-3 py-2 text-xs text-zinc-300">
                <Link
                  href={`/admin/drops/${drop.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {String(drop.id).substring(0, 8)}...
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {drop.discipline_id ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {drop.topic_code ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                <Link
                  href={`/admin/drops/${drop.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {drop.title ?? "-"}
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {drop.difficulty ?? "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
