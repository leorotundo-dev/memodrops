"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface UserRow {
  id: number;
  email: string;
  name?: string;
  created_at?: string;
}

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/admin/users");
        setItems(data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar usuários:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="text-sm text-zinc-400">
          Lista de usuários do sistema (rota /admin/users deve ser implementada no backend).
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && (
        <Table headers={["ID", "E-mail", "Nome", "Criado em"]}>
          {items.map(user => (
            <tr key={user.id}>
              <td className="px-3 py-2 text-xs text-zinc-300">{user.id}</td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                {user.email}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {user.name ?? "-"}
              </td>
              <td className="px-3 py-2 text-xs text-zinc-400">
                {user.created_at
                  ? new Date(user.created_at).toLocaleString("pt-BR")
                  : "-"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
