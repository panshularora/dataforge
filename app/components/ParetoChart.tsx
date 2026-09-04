"use client";

import { useState, useEffect, useRef } from "react";

interface ScatterPoint {
  id: string;
  label: string;
  type: "latent" | "token" | "baseline";
  accuracy: number;
  cost_per_task: number;
  tokens_generated: number;
  latent_iterations: number;
  color: string;
}

interface ParetoData {
  systems: ScatterPoint[];
}

export default function ParetoChart() {
  const [data, setData] = useState<ParetoData | null>(null);
  const [mode, setMode] = useState<"all" | "latent" | "token">("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch("/data/pareto_frontier.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="h-64 flex items-center justify-center text-gray-400">Loading…</div>;

  const filtered = data.systems.filter((s) => {
    if (mode === "latent") return s.type !== "token";
    if (mode === "token") return s.type !== "latent";
    return true;
  });

  // SVG dimensions
  const W = 500, H = 280, PAD = { top: 20, right: 30, bottom: 50, left: 55 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxCost = 45, minCost = 0.5;
  const maxAcc = 1.0, minAcc = 0.3;

  const toX = (cost: number) =>
    PAD.left + ((Math.log(cost) - Math.log(minCost)) / (Math.log(maxCost) - Math.log(minCost))) * innerW;
  const toY = (acc: number) =>
    PAD.top + (1 - (acc - minAcc) / (maxAcc - minAcc)) * innerH;

  // Pareto frontier line for BDH-CQ
  const bdhPoints = data.systems
    .filter((s) => s.type === "latent")
    .sort((a, b) => a.cost_per_task - b.cost_per_task);
  const paretoPath = bdhPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.cost_per_task)} ${toY(p.accuracy)}`)
    .join(" ");

  const cotPoints = data.systems
    .filter((s) => s.type === "token")
    .sort((a, b) => a.cost_per_task - b.cost_per_task);
  const cotPath = cotPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.cost_per_task)} ${toY(p.accuracy)}`)
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
        💡 A system is on the <strong>Pareto frontier</strong> when no alternative is both cheaper <em>and</em> more accurate.
        BDH-CQ (latent compute) reaches higher accuracy at lower cost than equivalent CoT token budgets.
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        {(["all", "latent", "token"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
              mode === m ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
            }`}
          >
            {m === "all" ? "Show All" : m === "latent" ? "🟣 BDH-CQ (Latent)" : "🟡 CoT (Token)"}
          </button>
        ))}
      </div>

      {/* SVG chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto">
          {/* Grid lines */}
          {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((acc) => (
            <line key={acc} x1={PAD.left} x2={W - PAD.right} y1={toY(acc)} y2={toY(acc)}
              stroke="#f0f0f0" strokeWidth={1} />
          ))}
          {/* Axes */}
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#ccc" />
          <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#ccc" />

          {/* Y axis labels */}
          {[0.4, 0.6, 0.8, 1.0].map((acc) => (
            <text key={acc} x={PAD.left - 5} y={toY(acc) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
              {Math.round(acc * 100)}%
            </text>
          ))}
          {/* Y axis title */}
          <text x={12} y={H / 2} textAnchor="middle" fontSize={11} fill="#6b7280"
            transform={`rotate(-90, 12, ${H / 2})`}>
            ARC-AGI Accuracy
          </text>

          {/* X axis labels (log scale) */}
          {[1, 4, 10, 40].map((c) => (
            <text key={c} x={toX(c)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={10} fill="#9ca3af">
              {c}×
            </text>
          ))}
          <text x={W / 2} y={H - 5} textAnchor="middle" fontSize={11} fill="#6b7280">
            Relative Cost per Task (log scale)
          </text>

          {/* BDH-CQ frontier line */}
          {(mode === "all" || mode === "latent") && (
            <path d={paretoPath} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" opacity={0.5} />
          )}
          {/* CoT line */}
          {(mode === "all" || mode === "token") && (
            <path d={cotPath} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" opacity={0.5} />
          )}

          {/* Data points */}
          {filtered.map((s) => {
            const x = toX(s.cost_per_task);
            const y = toY(s.accuracy);
            const isHov = hovered === s.id;
            return (
              <g key={s.id}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer">
                <circle cx={x} cy={y} r={isHov ? 9 : 7}
                  fill={s.color} stroke="white" strokeWidth={2}
                  style={{ transition: "r 0.15s" }} />
                {isHov && (
                  <g>
                    <rect x={x + 10} y={y - 28} width={130} height={56} rx={6} fill="white"
                      stroke="#e5e7eb" strokeWidth={1} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                    <text x={x + 16} y={y - 12} fontSize={10} fill="#374151" fontWeight="600">{s.label}</text>
                    <text x={x + 16} y={y + 2} fontSize={9} fill="#6b7280">
                      Accuracy: {Math.round(s.accuracy * 100)}%
                    </text>
                    <text x={x + 16} y={y + 14} fontSize={9} fill="#6b7280">
                      Cost: {s.cost_per_task}× | Tokens: {s.tokens_generated}
                    </text>
                    <text x={x + 16} y={y + 26} fontSize={9} fill={s.color} fontWeight="600">
                      {s.type === "latent" ? "Latent (no CoT)" : s.type === "token" ? "Token (CoT)" : "Baseline"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> BDH-CQ (Latent iterations — no CoT)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> CoT (Generated reasoning tokens)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Baseline (No scaling)</div>
      </div>
      <p className="text-xs text-gray-400">
        Source: BDH-CQ Technical Report (Pathway, 2025); Snell et al. "Scaling LLM Test-Time Compute Optimally" (NeurIPS 2024).
        Cost normalized to 1× single-pass inference. Hover data points for details.
      </p>
    </div>
  );
}
