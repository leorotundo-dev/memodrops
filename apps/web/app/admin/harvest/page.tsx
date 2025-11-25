"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface HarvestItem {
  id: string | number;
  source?: string;
  url?: string;
  status?: string;
  title?: string;
  description?: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export default function HarvestPage() {
  const [items, setItems] = useState<HarvestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/admin/harvest/items");
        setItems(data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar harvest items:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Harvest Items</h1>
        <p className="text-sm text-zinc-400">
          Itens colhidos do sistema.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-lg bg-zinc-900/40 border border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-400">Nenhum harvest item encontrado</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <Table headers={["ID", "Título", "Status", "Progresso", "Criado em", "Atualizado em"]}>
          {items.map(item => (
            <tr key={item.id} className="hover:bg-zinc-800/40 cursor-pointer transition-colors">
              <td className="px-3 py-2 text-xs text-zinc-300 font-mono">
                <Link
                  href={`/admin/harvest/${item.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {typeof item.id === "string" ? item.id.substring(0, 8) : item.id}...
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                <Link
                  href={`/admin/harvest/${item.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {item.title || item.source || "-"}
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                <span className="capitalize">{item.status ?? "-"}</span>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {item.progress !== undefined ? `${item.progress}%` : "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-500">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-500">
                {item.updated_at
                  ? new Date(item.updated_at).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
