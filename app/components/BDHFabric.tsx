"use client";

import { useMemo, useState } from "react";
import Evidence from "./Evidence";

const N = 18;
const ACTIVE = 0.05;

function hash(i: number, t: number) {
  const x = Math.sin((i + 1) * 12.9898 + t * 0.017) * 43758.5453;
  return x - Math.floor(x);
}

export default function BDHFabric() {
  const [len, setLen] = useState(2048);
  const [tick, setTick] = useState(3);

  const cells = useMemo(() => {
    return Array.from({ length: N * N }, (_, i) => {
      const p = hash(i, tick);
      const active = p < ACTIVE + (tick % 7 === i % 7 ? 0.02 : 0);
      return { i, active, a: 0.45 + p * 0.55 };
    });
  }, [tick]);

  const kv = len * 64 * 2 * 2; // tokens × d_head-ish × K/V × fp16 — schematic
  const syn = 256 * 256 * 2; // fixed schematic state
  const ratio = kv / syn;

  return (
    <div className="fabric">
      <p className="lead">
        BDH is the architecture family. BDH-CQ is the reasoning system on top of
        it. They are not interchangeable, and BDH is not an SSM in the Mamba sense.
      </p>

      <div className="eq-stack">
        <div className="eq-card">
          <div className="meter-k">Recurrent memory · in-context write</div>
          <div className="eq">
            S<sub>t</sub> = U<sub>θ</sub>(S<sub>t−1</sub>, D<sub>t</sub>)
          </div>
          <p>
            Demonstrations update a fixed-size associative state. Linear attention
            is the special case S<sub>t</sub> = S<sub>t−1</sub> + U<sub>θ</sub>(D<sub>t</sub>).
            θ does not move.
          </p>
        </div>
        <div className="eq-card">
          <div className="meter-k">Latent workspace · test-time compute</div>
          <div className="eq">
            H<sub>r+1</sub> = F<sub>θ</sub>(H<sub>r</sub>, S<sub>K</sub>)
          </div>
          <p>
            After K demos are ingested, the query is encoded and iterated in a
            structured latent workspace. The answer is decoded only at the end.
            Dimensions of F<sub>θ</sub> remain proprietary.
          </p>
        </div>
        <div className="eq-card">
          <div className="meter-k">Hebbian synaptic write (BDH family)</div>
          <div className="eq">
            σ ← σ + η · (pre ⊗ post)
          </div>
          <p>
            Working memory during inference is synaptic plasticity, not a growing
            KV table. Reported in trained BDH: sparse non-negative activations
            (~5%), monosemantic synapses, heavy-tailed connectivity.
          </p>
        </div>
      </div>

      <div className="fabric-split">
        <div>
          <div className="meter-k">Schematic sparse field · ~5% lit</div>
          <svg
            viewBox={`0 0 ${N * 14} ${N * 14}`}
            className="neuron-svg"
            role="img"
            aria-label="Schematic sparse neuron field"
          >
            {cells.map((c) => {
              const r = Math.floor(c.i / N);
              const col = c.i % N;
              return (
                <rect
                  key={c.i}
                  x={col * 14}
                  y={r * 14}
                  width={12}
                  height={12}
                  rx={1}
                  fill={c.active ? "var(--kiln)" : "var(--ink)"}
                  opacity={c.active ? c.a : 0.08}
                />
              );
            })}
          </svg>
          <div className="seq-row">
            <label>
              Novelty pulse
              <input
                type="range"
                min={0}
                max={12}
                value={tick}
                onChange={(e) => setTick(Number(e.target.value))}
              />
            </label>
            <p className="grid-cap">
              Illustrative of reported activity-with-predictability, not a recorded
              BDH activation map.
            </p>
          </div>
        </div>
        <div>
          <div className="meter-k">Sequence length {len.toLocaleString()} tokens</div>
          <input
            type="range"
            min={128}
            max={8192}
            step={128}
            value={len}
            onChange={(e) => setLen(Number(e.target.value))}
            aria-label="Sequence length"
          />
          <div className="mem-compare">
            <div>
              <div className="meter-k">Transformer KV (schematic)</div>
              <div className="meter-v">{(kv / 1024).toFixed(0)} KB</div>
              <p>Grows with length. One extra token, one extra slot.</p>
            </div>
            <div>
              <div className="meter-k">Fixed associative state</div>
              <div className="meter-v">{(syn / 1024).toFixed(0)} KB</div>
              <p>
                Constant. Superposition can interfere — that is the trade, not a
                solved memory problem.
              </p>
            </div>
          </div>
          <p className="paper-note">
            Schematic ratio at this length: KV ~{ratio.toFixed(1)}× the fixed
            state under a toy d=256, single-layer assumption. Real models have
            layers, heads, and (in BDH-GPU) ReLU-low-rank linear attention. Do
            not treat these kilobytes as a published BDH-CQ memory trace.
          </p>
        </div>
      </div>

      <table className="cmp">
        <thead>
          <tr>
            <th> </th>
            <th>Transformer + CoT</th>
            <th>HRM / TRM on ARC</th>
            <th>BDH-CQ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Where extra compute goes</td>
            <td>Decoded tokens</td>
            <td>Per-puzzle optimization</td>
            <td>Latent iterations of H</td>
          </tr>
          <tr>
            <td>Eval-task backward pass</td>
            <td>No (typically)</td>
            <td>Yes</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Memory at inference</td>
            <td>Growing KV</td>
            <td>Task identity + weights</td>
            <td>Fixed recurrent S</td>
          </tr>
          <tr>
            <td>Observable trace</td>
            <td>Text</td>
            <td>Optimization path</td>
            <td>None (latent)</td>
          </tr>
        </tbody>
      </table>
      <p className="paper-note">
        <Evidence>Paper · §3, §8</Evidence> BDH-GPU is a ReLU-low-rank + linear
        attention formulation, not Mamba. Independent black-box audit (Kinas /
        Zhong) reproduced 29.5% pass@2 without weights.
      </p>
    </div>
  );
}
