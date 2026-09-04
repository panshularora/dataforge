"use client";

import { ARC_HEX } from "@/lib/arcColors";

const AXES = [1, 2, 3, 4];

export default function SynapseMap({
  S,
  caption,
}: {
  S: number[][] | null;
  caption: string;
}) {
  if (!S) {
    return (
      <figure className="syn">
        <figcaption className="grid-kicker">S · recurrent memory</figcaption>
        <p className="grid-cap">
          Settle does not write a color map. Its operator is a local fall rule
          applied to H. Extra R only helps when the update already contains the
          operator.
        </p>
      </figure>
    );
  }

  let max = 1;
  for (const o of AXES) for (const i of AXES) if (S[o][i] > max) max = S[o][i];

  const cells: { key: string; bg: string; opacity: number; title: string; kind: string }[] = [
    { key: "corner", bg: "transparent", opacity: 1, title: "in → out", kind: "corner" },
  ];
  for (const i of AXES) {
    cells.push({
      key: `in-${i}`,
      bg: ARC_HEX[i],
      opacity: 1,
      title: `in ${i}`,
      kind: "axis",
    });
  }
  for (const o of AXES) {
    cells.push({
      key: `out-${o}`,
      bg: ARC_HEX[o],
      opacity: 1,
      title: `out ${o}`,
      kind: "axis",
    });
    for (const i of AXES) {
      const v = S[o][i];
      cells.push({
        key: `${o}-${i}`,
        bg: v === 0 ? "#141c18" : ARC_HEX[o],
        opacity: v === 0 ? 0.12 : 0.28 + (v / max) * 0.72,
        title: `${i} → ${o}: ${v}`,
        kind: "cell",
      });
    }
  }

  return (
    <figure className="syn">
      <figcaption className="grid-kicker">S · in → out (Hebbian write)</figcaption>
      <div className="syn-plate" role="img" aria-label="Fast-weight color map">
        {cells.map((c) => (
          <span
            key={c.key}
            className={`syn-cell syn-${c.kind}`}
            title={c.title}
            style={{ background: c.bg, opacity: c.opacity }}
          />
        ))}
      </div>
      <p className="grid-cap">{caption}</p>
    </figure>
  );
}
