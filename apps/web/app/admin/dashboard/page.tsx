"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { StatCard } from "../../../components/ui/StatCard";
import { FinancialSummary } from "../../../components/FinancialSummary";

interface DashboardStats {
  usersCount: number;
  dropsCount: number;
  disciplinesCount: number;
  reviewsToday: number;
}

interface CostData {
  totalCost: number;
  currency: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [costs, setCosts] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Buscar métricas
        const metricsData = await apiGet("/admin/metrics/overview");
        setStats({
          usersCount: metricsData.usersCount ?? 0,
          dropsCount: metricsData.dropsCount ?? 0,
          disciplinesCount: metricsData.disciplinesCount ?? 0,
          reviewsToday: metricsData.reviewsToday ?? 0
        });

        // Buscar custos
        const costsData = await apiGet("/admin/costs/real/overview");
        setCosts({
          totalCost: costsData.thisMonth ?? 0,
          currency: "BRL"
        });
      } catch (e) {
        console.error("Erro ao buscar dados:", e);
        setError("Erro ao carregar dados do dashboard");
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

      {/* Resumo Financeiro */}
      <FinancialSummary />

      {/* Custo Total */}
      {!loading && costs && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-sm text-zinc-400 mb-2">Custo Total Mensal</p>
          <div className="text-3xl font-bold text-white">
            R$ {costs.totalCost.toFixed(2)}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-semibold mb-4">Métricas Gerais</h2>
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
    </div>
  );
}
