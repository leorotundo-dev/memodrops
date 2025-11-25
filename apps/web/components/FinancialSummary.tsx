"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

interface CostData {
  totalCost: number;
  totalCostCents: number;
  currency: string;
  breakdown: Array<{
    service: string;
    cost: number;
    costCents: number;
    breakdown: Record<string, number>;
  }>;
  lastUpdated: string;
}

export function FinancialSummary() {
  const [costs, setCosts] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/admin/costs/real/overview");
        setCosts(data);
      } catch (e) {
        console.error("Erro ao buscar custos:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-zinc-400">Carregando custos...</div>;
  }

  if (!costs) {
    return <div className="text-sm text-zinc-400">Erro ao carregar custos</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Resumo Financeiro
        </h2>
      </div>

      {/* Custo Total */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-6 text-white">
        <div className="text-sm font-medium opacity-90">Custo Total Mensal</div>
        <div className="text-4xl font-bold mt-2">
          R$ {(costs.totalCost / 100).toFixed(2)}
        </div>
        <div className="text-xs opacity-75 mt-2">
          Atualizado em {new Date(costs.lastUpdated).toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Breakdown por serviço */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {costs.breakdown.map((item) => (
          <div
            key={item.service}
            className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
          >
            <div className="text-xs text-zinc-400 capitalize">{item.service}</div>
            <div className="text-lg font-semibold text-zinc-50 mt-2">
              R$ {(item.cost / 100).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
