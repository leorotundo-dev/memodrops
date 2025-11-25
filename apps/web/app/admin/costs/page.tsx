"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { mockCosts } from "../../../lib/mockData";
import { CostsChart } from "../../../components/CostsChart";

interface CostOverview {
  totalCost: number;
  currency: string;
  period: string;
  breakdown: Array<{
    service: string;
    cost: number;
    breakdown: Record<string, number>;
  }>;
  lastUpdated: string;
}

export default function CostsPage() {
  const [costs, setCosts] = useState<CostOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet("/admin/costs/real/overview");
        setCosts({
          totalCost: data.thisMonth ?? 0,
          currency: "BRL",
          period: "Novembro 2024",
          breakdown: [
            {
              service: "Railway",
              cost: data.breakdown?.railway?.total ?? 0,
              breakdown: data.breakdown?.railway ?? {}
            },
            {
              service: "Vercel",
              cost: data.breakdown?.vercel?.total ?? 0,
              breakdown: data.breakdown?.vercel ?? {}
            },
            {
              service: "OpenAI",
              cost: data.breakdown?.openai?.total ?? 0,
              breakdown: data.breakdown?.openai ?? {}
            }
          ],
          lastUpdated: new Date().toISOString()
        });
      } catch (e) {
        console.error("Erro ao buscar custos:", e);
        // Usar dados mock como fallback
        const mockData = mockCosts.real.overview;
        setCosts({
          totalCost: mockData.thisMonth,
          currency: "BRL",
          period: "Novembro 2024",
          breakdown: [
            {
              service: "Railway",
              cost: mockData.breakdown.railway.total,
              breakdown: mockData.breakdown.railway
            },
            {
              service: "Vercel",
              cost: mockData.breakdown.vercel.total,
              breakdown: mockData.breakdown.vercel
            },
            {
              service: "OpenAI",
              cost: mockData.breakdown.openai.total,
              breakdown: mockData.breakdown.openai
            }
          ],
          lastUpdated: new Date().toISOString()
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
        <h1 className="text-2xl font-semibold">Custos</h1>
        <p className="text-sm text-zinc-400">
          Visão geral dos custos de infraestrutura e serviços.
        </p>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando...</p>}

      {!loading && costs && (
        <>
          {/* Total de custos */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-2">Custo Total Mensal</p>
                <div className="text-4xl font-bold text-white">
                  {costs.currency} {costs.totalCost.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-1">Período</p>
                <p className="text-sm font-medium text-zinc-300 capitalize">
                  {costs.period}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Atualizado em{" "}
                {new Date(costs.lastUpdated).toLocaleDateString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>

          {/* Gráfico de custos */}
          <CostsChart data={costs.breakdown} />
        </>
      )}
    </div>
  );
}
