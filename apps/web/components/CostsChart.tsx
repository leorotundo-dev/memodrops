"use client";

import { useEffect, useState } from "react";

interface CostData {
  service: string;
  cost: number;
  breakdown: Record<string, number>;
}

export function CostsChart({ data }: { data: CostData[] }) {
  const total = data.reduce((sum, item) => sum + item.cost, 0);
  const colors = {
    railway: "#0B84F3",
    vercel: "#000000",
    openai: "#10A37F"
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {data.map(item => (
          <div
            key={item.service}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium capitalize text-zinc-300">
                {item.service}
              </h3>
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    colors[item.service as keyof typeof colors] || "#666"
                }}
              />
            </div>
            <div className="text-2xl font-bold text-white">
              R$ {item.cost.toFixed(2)}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              {((item.cost / total) * 100).toFixed(1)}% do total
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown detalhado */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Detalhamento</h3>
        <div className="space-y-3">
          {data.map(item => (
            <div key={item.service}>
              <div className="text-xs font-medium text-zinc-400 mb-2 capitalize">
                {item.service}
              </div>
              <div className="space-y-1 ml-2">
                {Object.entries(item.breakdown).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between text-xs text-zinc-500"
                  >
                    <span className="capitalize">{key}:</span>
                    <span>R$ {value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
