"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface HarvestItem {
  id: number;
  source: string;
  url: string;
  status: string;
  created_at?: string;
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
        <h1 className="text-2xl font-semibold">Harvest</h1>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && (
        <Table headers={["ID", "Fonte", "URL", "Status", "Criado em"]}>
          {items.map(item => (
            <tr key={item.id}>
              <td className="px-3 py-2 text-xs text-zinc-300">{item.id}</td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                {item.source}
              </td>
              <td className="px-3 py-2 text-xs text-blue-400 underline">
                <a href={item.url} target="_blank">
                  {item.url}
                </a>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {item.status}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {item.created_at
                  ? new Date(item.created_at).toLocaleString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
