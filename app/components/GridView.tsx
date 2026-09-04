"use client";

import { arcFill } from "@/lib/arcColors";
import type { Grid } from "@/lib/latentEngine";

interface Props {
  grid: Grid;
  label?: string;
  caption?: string;
  changed?: boolean[][];
  highlight?: "match" | "miss" | null;
  size?: "sm" | "md" | "lg";
}

const CELL = { sm: 14, md: 22, lg: 32 };

export default function GridView({
  grid,
  label,
  caption,
  changed,
  highlight = null,
  size = "md",
}: Props) {
  const s = CELL[size];
  const ring =
    highlight === "match"
      ? "outline outline-2 outline-[var(--ok)]"
      : highlight === "miss"
        ? "outline outline-2 outline-[var(--fail)]"
        : "";

  return (
    <figure className="grid-view">
      {label ? <figcaption className="grid-kicker">{label}</figcaption> : null}
      <div className={`grid-plate ${ring}`} role="img" aria-label={label ?? "grid"}>
        {grid.map((row, i) => (
          <div key={i} className="grid-row">
            {row.map((v, j) => (
              <span
                key={j}
                className={`grid-cell${changed?.[i]?.[j] ? " is-changed" : ""}`}
                style={{
                  width: s,
                  height: s,
                  background: arcFill(v),
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {caption ? <p className="grid-cap">{caption}</p> : null}
    </figure>
  );
}
