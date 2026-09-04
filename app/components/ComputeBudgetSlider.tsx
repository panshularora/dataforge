"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart
} from "recharts";

interface ScalingPoint {
  iterations: number;
  accuracy: number;
  cost: number;
}

interface EffortLevel {
  label: string;
  latent_iterations: number;
  arc_agi_accuracy: number;
  relative_cost: number;
  description: string;
}

interface BDHData {
  scaling_curve: ScalingPoint[];
  effort_levels: Record<string, EffortLevel>;
}

export default function ComputeBudgetSlider() {
  const [data, setData] = useState<BDHData | null>(null);
  const [iterations, setIterations] = useState(1);
  const [activePoint, setActivePoint] = useState<ScalingPoint | null>(null);

  useEffect(() => {
    fetch("/data/bdh_cq_results.json")
      .then((r) => r.json())
      .then((d: BDHData) => {
        setData(d);
        setActivePoint(d.scaling_curve[0]);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    const found = data.scaling_curve.find((p) => p.iterations === iterations);
    setActivePoint(found ?? null);
  }, [iterations, data]);

  if (!data) return <div className="h-64 flex items-center justify-center text-gray-400">Loading…</div>;

  const pct = activePoint ? Math.round(activePoint.accuracy * 100) : 0;

  const iterOptions = data.scaling_curve.map((p) => p.iterations);

  return (
    <div className="space-y-6">
      {/* Claim banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800 font-medium">
        🔬 <strong>Falsifiable claim:</strong> Allocating more latent compute iterations to BDH-CQ improves ARC-AGI accuracy
        — without generating a single chain-of-thought token.
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>1× (single pass)</span>
          <span>16× (max latent budget)</span>
        </div>
        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Latent iterations: <strong className="text-indigo-700">{iterations}×</strong>
          </span>
          <span className="text-sm text-gray-500">
            Tokens generated: <strong className="text-green-600">0</strong> (pure latent compute)
          </span>
        </div>
      </div>

      {/* Accuracy meter */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ARC-AGI Accuracy</div>
          <div className="text-5xl font-bold text-indigo-600">{pct}%</div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-400">
            Relative cost: {activePoint?.cost.toFixed(1)}× baseline
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-center items-center text-center">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CoT Tokens</div>
          <div className="text-4xl font-bold text-green-500">0</div>
          <div className="text-xs text-gray-400 mt-1">No verbal reasoning emitted</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Accuracy vs. Latent Iterations
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.scaling_curve} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="iterations" label={{ value: "Latent Iterations", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
            <YAxis domain={[0.3, 1.0]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(val: number) => [`${Math.round(val * 100)}%`, "Accuracy"]}
              labelFormatter={(l) => `Iterations: ${l}×`}
            />
            <ReferenceLine x={iterations} stroke="#6366f1" strokeDasharray="4 2" label={{ value: "▶", fill: "#6366f1", fontSize: 14 }} />
            <Area type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2.5} fill="url(#accuracyGrad)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Iter selector chips */}
      <div className="flex gap-2 flex-wrap">
        {iterOptions.map((it) => (
          <button
            key={it}
            onClick={() => setIterations(it)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              iterations === it
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
            }`}
          >
            {it}× {it === 1 ? "(baseline)" : it === 4 ? "(medium)" : it === 16 ? "(max)" : ""}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Source: BDH-CQ Technical Report (Pathway, 2025). Values are reported model results from the ARC-AGI evaluation set.
        Cost is normalized to single-pass inference (1×). No fine-tuning or parameter updates occur between iterations.
      </p>
    </div>
  );
}
