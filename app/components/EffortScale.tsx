"use client";

import { useState } from "react";
import Evidence from "./Evidence";
import {
  TABLE5,
  HEADLINE,
  SECTION_66,
  derivedCostUsd,
} from "@/lib/published";

const POINTS = [
  { ...TABLE5.low, key: "low" as const },
  { ...TABLE5.medium, key: "med" as const },
  { ...TABLE5.high, key: "high" as const },
];

export default function EffortScale() {
  const [sel, setSel] = useState<(typeof POINTS)[number]["key"]>("high");
  const active = POINTS.find((p) => p.key === sel)!;
  const cost = derivedCostUsd(active.costReductionVsHigh);
  const maxPct = 32;

  return (
    <div className="effort">
      <p className="lead">
        The paper does not publish an internal iteration count. It publishes three
        named effort settings on a model trained at those budgets. Exact R is
        proprietary (§3.3).
      </p>

      <div className="effort-pills" role="tablist">
        {POINTS.map((p) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={p.key === sel}
            className={p.key === sel ? "is-on" : ""}
            onClick={() => setSel(p.key)}
          >
            {p.effort}
          </button>
        ))}
      </div>

      <div className="effort-readout">
        <div>
          <div className="meter-k">pass@2 · 400 public tasks</div>
          <div className="meter-v">{(active.passAt2 * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div className="meter-k">Implied cost / task</div>
          <div className="meter-v">${cost.toFixed(5)}</div>
        </div>
        <div>
          <div className="meter-k">Verbal CoT tokens</div>
          <div className="meter-v meter-zero">0</div>
        </div>
      </div>

      <svg viewBox="0 0 640 220" className="effort-svg" role="img" aria-label="Table 5 effort scaling">
        <text x="8" y="16" className="svg-label">
          pass@2
        </text>
        {[21, 27, 29.5].map((y) => {
          const py = 180 - (y / maxPct) * 160;
          return (
            <g key={y}>
              <line x1="48" x2="620" y1={py} y2={py} className="svg-grid" />
              <text x="44" y={py + 4} textAnchor="end" className="svg-tick">
                {y}%
              </text>
            </g>
          );
        })}
        {POINTS.map((p, i) => {
          const x = 110 + i * 200;
          const h = (p.passAt2 * 100) / maxPct * 160;
          const y = 180 - h;
          const on = p.key === sel;
          return (
            <g key={p.key} onClick={() => setSel(p.key)} style={{ cursor: "pointer" }}>
              <rect
                x={x - 28}
                y={y}
                width={56}
                height={h}
                rx={2}
                fill={on ? "var(--kiln)" : "var(--teal)"}
                opacity={on ? 1 : 0.55}
              />
              <text x={x} y={y - 8} textAnchor="middle" className="svg-strong">
                {(p.passAt2 * 100).toFixed(1)}%
              </text>
              <text x={x} y={198} textAnchor="middle" className="svg-tick">
                {p.effort}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="paper-note">
        <Evidence>Paper · Table 5</Evidence> LOW 21% · MEDIUM 27% · HIGH 29.5%.
        Cost column is “cost reduction vs HIGH”; dollars on HIGH are the §5
        headline ${HEADLINE.costUsd.toFixed(4)} (0.85 H200-s at $3/h). MEDIUM and
        LOW dollars here are that headline times (1 − reported reduction) — derived,
        not independently tabulated.
      </p>

      <aside className="caveat">
        <strong>§6.6 is a different knob.</strong> On the deployed system, a MIN
        pass scored {SECTION_66.minSolved}/{SECTION_66.nTasks} against STANDARD{" "}
        {SECTION_66.standardSolved}/{SECTION_66.nTasks} (−1.75 pp). McNemar p ={" "}
        {SECTION_66.mcnemarP} — statistically unresolved. The 21 → 29.5 jump is
        the Table 5 training-and-select protocol, not “turn R up on one frozen
        checkpoint.”
      </aside>
    </div>
  );
}
