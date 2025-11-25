"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../../lib/api";
import { Table } from "../../../components/ui/Table";

interface UserRow {
  id: string | number;
  email: string;
  name?: string;
  created_at?: string;
}

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet("/admin/users");
        setItems(data?.items ?? data ?? []);
      } catch (e) {
        console.error("Erro ao buscar usuários:", e);
        setError("Erro ao carregar usuários");
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
          Lista de usuários do sistema.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          <p className="text-sm text-zinc-400">Nenhum usuário encontrado</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <Table headers={["ID", "E-mail", "Nome", "Criado em"]}>
          {items.map(user => (
            <tr
              key={user.id}
              className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
            >
              <td className="px-3 py-2 text-xs text-zinc-300">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {String(user.id).substring(0, 8)}...
                </Link>
              </td>
              <td className="px-3 py-2 text-xs text-zinc-50">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="hover:text-blue-400 hover:underline"
                >
                  {user.email}
                </Link>
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
