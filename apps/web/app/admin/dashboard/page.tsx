"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { StatCard } from "../../../components/ui/StatCard";

interface DashboardStats {
  usersCount: number;
  dropsCount: number;
  disciplinesCount: number;
  reviewsToday: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Ajuste essa rota para o endpoint real de métricas/admin que você tiver
        const data = await apiGet("/admin/metrics/daily?metricName=overview");
        setStats({
          usersCount: data.usersCount ?? 0,
          dropsCount: data.dropsCount ?? 0,
          disciplinesCount: data.disciplinesCount ?? 0,
          reviewsToday: data.reviewsToday ?? 0
        });
      } catch (e) {
        console.error("Erro ao buscar métricas:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Visão geral do que está acontecendo no MemoDrops.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Usuários" value={stats.usersCount} />
          <StatCard label="Drops" value={stats.dropsCount} />
          <StatCard label="Disciplinas" value={stats.disciplinesCount} />
          <StatCard label="Reviews hoje" value={stats.reviewsToday} />
        </div>
      )}
    </div>
  );
}
