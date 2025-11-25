"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface Drop {
  id: number;
  discipline_id?: number;
  topic_code?: string;
  title?: string;
  difficulty?: number;
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/drops");
        setDrops(data?.drops ?? data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar drops:", e);
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

      {!loading && (
        <Table headers={["ID", "Disciplina", "Tópico", "Título", "Dificuldade"]}>
          {drops.map(drop => (
            <tr key={drop.id}>
              <td className="px-3 py-2 text-xs text-zinc-300">{drop.id}</td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {drop.discipline_id ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {drop.topic_code ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                {drop.title ?? "-"}
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
