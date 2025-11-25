"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { mockMetrics } from "../../../lib/mockData";
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

  useEffect(() => {
    async function load() {
      setLoading(true);
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
          totalCost: costsData.totalCost ?? 0,
          currency: costsData.currency ?? "BRL"
        });
      } catch (e) {
        console.error("Erro ao buscar dados:", e);
        // Usar dados mock como fallback
        setStats({
          usersCount: mockMetrics.overview.totalUsers,
          dropsCount: mockMetrics.overview.totalDrops,
          disciplinesCount: mockMetrics.overview.totalDisciplines,
          reviewsToday: mockMetrics.overview.totalReviews
        });
        setCosts({
          totalCost: mockMetrics.overview.costThisMonth,
          currency: "BRL"
        });
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
            {costs.currency} {costs.totalCost.toFixed(2)}
          </div>
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
