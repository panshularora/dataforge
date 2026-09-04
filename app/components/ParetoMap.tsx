"use client";

import { useState } from "react";
import Evidence from "./Evidence";
import {
  HEADLINE,
  TABLE5,
  LUNA,
  TRANSDUCTIVE_COSTS,
  derivedCostUsd,
} from "@/lib/published";

interface Pt {
  id: string;
  label: string;
  acc: number;
  cost: number;
  kind: "bdh" | "luna" | "note";
  note: string;
}

const POINTS: Pt[] = [
  {
    id: "low",
    label: "BDH-CQ LOW",
    acc: TABLE5.low.passAt2,
    cost: derivedCostUsd(TABLE5.low.costReductionVsHigh),
    kind: "bdh",
    note: "Table 5 · derived $ from 22% reduction",
  },
  {
    id: "med",
    label: "BDH-CQ MEDIUM",
    acc: TABLE5.medium.passAt2,
    cost: derivedCostUsd(TABLE5.medium.costReductionVsHigh),
    kind: "bdh",
    note: "Table 5 · derived $ from 11% reduction",
  },
  {
    id: "high",
    label: "BDH-CQ HIGH",
    acc: HEADLINE.passAt2,
    cost: HEADLINE.costUsd,
    kind: "bdh",
    note: "§5 headline · 118/400 pass@2 · $0.00070",
  },
  {
    id: "luna",
    label: LUNA.name,
    acc: LUNA.passAt2,
    cost: LUNA.leaderboardCostUsd,
    kind: "luna",
    note: `ARC Prize leaderboard ${LUNA.leaderboardDate} · more accurate, ~57× costlier at listed price`,
  },
];

const W = 640;
const H = 320;
const PAD = { t: 28, r: 24, b: 48, l: 56 };
const innerW = W - PAD.l - PAD.r;
const innerH = H - PAD.t - PAD.b;
const minC = 0.0004;
const maxC = 0.08;
const minA = 0.18;
const maxA = 0.38;

function xOf(c: number) {
  const t = (Math.log(c) - Math.log(minC)) / (Math.log(maxC) - Math.log(minC));
  return PAD.l + t * innerW;
}
function yOf(a: number) {
  return PAD.t + (1 - (a - minA) / (maxA - minA)) * innerH;
}

export default function ParetoMap() {
  const [hov, setHov] = useState<string | null>("high");
  const active = POINTS.find((p) => p.id === hov) ?? POINTS[2];

  const bdh = POINTS.filter((p) => p.kind === "bdh").sort((a, b) => a.cost - b.cost);
  const path = bdh
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.cost)} ${yOf(p.acc)}`)
    .join(" ");

  return (
    <div className="pareto">
      <p className="lead">
        A point is on the cost–accuracy frontier when nothing plotted is both
        cheaper and more accurate. BDH-CQ’s claim is the <em>left</em> edge of
        this plane — not a higher score than Luna.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="pareto-svg" role="img" aria-label="Cost accuracy plane">
        {[0.21, 0.27, 0.295, 0.342].map((a) => (
          <g key={a}>
            <line x1={PAD.l} x2={W - PAD.r} y1={yOf(a)} y2={yOf(a)} className="svg-grid" />
            <text x={PAD.l - 8} y={yOf(a) + 4} textAnchor="end" className="svg-tick">
              {(a * 100).toFixed(1)}%
            </text>
          </g>
        ))}
        {[0.0007, 0.007, 0.04].map((c) => (
          <text key={c} x={xOf(c)} y={H - 14} textAnchor="middle" className="svg-tick">
            ${c < 0.01 ? c.toFixed(4) : c.toFixed(2)}
          </text>
        ))}
        <text x={12} y={H / 2} className="svg-label" transform={`rotate(-90 12 ${H / 2})`}>
          ARC-AGI-1 pass@2
        </text>
        <text x={W / 2} y={H - 2} textAnchor="middle" className="svg-label">
          USD per task, log
        </text>
        <path d={path} fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="5 4" />
        {POINTS.map((p) => (
          <g
            key={p.id}
            onMouseEnter={() => setHov(p.id)}
            onFocus={() => setHov(p.id)}
            tabIndex={0}
            className="pareto-pt"
          >
            <circle
              cx={xOf(p.cost)}
              cy={yOf(p.acc)}
              r={p.id === hov ? 8 : 6}
              fill={p.kind === "bdh" ? "var(--kiln)" : "var(--brass)"}
              stroke="var(--paper)"
              strokeWidth="2"
            />
            <text
              x={xOf(p.cost) + 10}
              y={yOf(p.acc) - 10}
              className="svg-tick"
            >
              {p.id === "luna" ? "Luna" : p.label.replace("BDH-CQ ", "")}
            </text>
          </g>
        ))}
      </svg>

      <div className="pareto-card">
        <div className="meter-k">{active.label}</div>
        <div className="pareto-stats">
          <span>{(active.acc * 100).toFixed(1)}% pass@2</span>
          <span>${active.cost < 0.01 ? active.cost.toFixed(5) : active.cost.toFixed(3)} / task</span>
        </div>
        <p>{active.note}</p>
      </div>

      <p className="paper-note">
        <Evidence>Paper · §5 · Fig. 2</Evidence> Leaderboard snapshot 4 Aug 2026.
        Luna is <strong>more accurate</strong> (34.2% vs 29.5%) and{" "}
        <strong>{LUNA.cheaperFactorBeforeCut}× costlier</strong> at listed $0.040;
        after the 30 Jul 80% API cut the paper still reports ~{LUNA.cheaperFactorAfterCut}×.
        HRM ${TRANSDUCTIVE_COSTS.hrmUsd.toFixed(2)} and TRM $
        {TRANSDUCTIVE_COSTS.trmUsd.toFixed(2)} per task are transductive solvers
        (evaluation-task optimization) — not plotted, because this chart is the
        in-context / no-backward-pass plane the paper argues on.
      </p>
    </div>
  );
}
