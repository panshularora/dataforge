"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import GridView from "./GridView";
import Evidence from "./Evidence";
import SynapseMap from "./SynapseMap";
import {
  TASKS,
  runToy,
  type ToyKind,
  type ToyTask,
} from "@/lib/latentEngine";

gsap.registerPlugin(useGSAP);

const WALK: { id: ToyKind | "effort"; label: string; hint: string }[] = [
  { id: "settle", label: "1 · Settle", hint: "R 0→2 matches truth. Tokens stay 0." },
  { id: "compose", label: "2 · Compose", hint: "Same budget. The motif never moves." },
  { id: "effort", label: "3 · Table 5", hint: "21 / 27 / 29.5. Not 85." },
];

export default function LatentWorkspace({
  autoPlayOnMount = true,
  defaultTask = "settle",
}: {
  autoPlayOnMount?: boolean;
  defaultTask?: ToyKind;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [taskId, setTaskId] = useState<ToyKind>(defaultTask);
  const task = useMemo(() => TASKS.find((t) => t.id === taskId) as ToyTask, [taskId]);
  const [mask, setMask] = useState<boolean[]>(() => task.demos.map(() => true));
  const snaps = useMemo(() => runToy(task, mask), [task, mask]);
  const [r, setR] = useState(0);
  const [playing, setPlaying] = useState(autoPlayOnMount);
  const step = snaps[Math.min(r, snaps.length - 1)];

  useEffect(() => {
    setMask(task.demos.map(() => true));
    setR(0);
    setPlaying(true);
  }, [task]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setR((cur) => {
        if (cur >= task.maxR) {
          setPlaying(false);
          return cur;
        }
        return cur + 1;
      });
    }, 520);
    return () => window.clearInterval(id);
  }, [playing, task.maxR]);

  const scrub = useCallback((next: number) => {
    setPlaying(false);
    setR(next);
  }, []);

  const pick = useCallback((id: ToyKind) => {
    setTaskId(id);
  }, []);

  useGSAP(
    () => {
      if (!root.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      gsap.from(".ws-block", {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.out",
      });
    },
    { scope: root, dependencies: [taskId] },
  );

  const verdict =
    task.solvesAt < 0
      ? "never matches truth"
      : step.correct
        ? `matches truth at R = ${task.solvesAt}`
        : `needs R = ${task.solvesAt}`;

  const synCaption =
    task.id === "bind"
      ? "Bright cells are associations written from the checked demos. Drop both demos and the read has nothing to retrieve."
      : "The map binds color, not location. Extra R re-reads the same S. Relocation was never written.";

  return (
    <div ref={root} className="workspace">
      <ol className="ws-block walk" aria-label="Sixty-second path">
        {WALK.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              className={w.id === taskId ? "is-on" : ""}
              onClick={() => {
                if (w.id === "effort") {
                  document.getElementById("effort")?.scrollIntoView({ behavior: "smooth" });
                  return;
                }
                pick(w.id);
              }}
            >
              <span className="walk-label">{w.label}</span>
              <span className="walk-hint">{w.hint}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="ws-block eq-bar" aria-label="BDH-CQ system interface">
        <div>
          <div className="meter-k">Write · in-context</div>
          <div className="eq-mini">S<sub>t</sub> = U<sub>θ</sub>(S<sub>t−1</sub>, D<sub>t</sub>)</div>
        </div>
        <div>
          <div className="meter-k">Think · latent R</div>
          <div className="eq-mini">H<sub>r+1</sub> = F<sub>θ</sub>(H<sub>r</sub>, S<sub>K</sub>)</div>
        </div>
        <div>
          <div className="meter-k">Decode</div>
          <div className="eq-mini">ŷ = G<sub>θ</sub>(H<sub>R</sub>)</div>
        </div>
        <p className="eq-bar-note">
          θ frozen. No eval-task backward pass. Toy uses the linear-attention
          special case plus a local fall rule. F<sub>θ</sub> itself is proprietary.
        </p>
      </div>

      <div className="ws-block task-switch" role="tablist" aria-label="Toy task">
        {TASKS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === taskId}
            className={t.id === taskId ? "is-on" : ""}
            onClick={() => pick(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <p className="ws-block lead">{task.whatItTests}</p>

      <div className="ws-block demo-row">
        {task.demos.map((d, i) => (
          <label key={i} className={`demo-pair${mask[i] === false ? " is-off" : ""}`}>
            <input
              type="checkbox"
              checked={mask[i] !== false}
              onChange={() => {
                setPlaying(false);
                setMask((m) => m.map((v, j) => (j === i ? !v : v)));
                setR(0);
              }}
            />
            <GridView grid={d.input} label={`Demo ${i + 1} in`} size="sm" />
            <span className="pair-arrow" aria-hidden>
              →
            </span>
            <GridView grid={d.output} label="out" size="sm" />
          </label>
        ))}
      </div>
      <p className="sandbox-hint">
        Sandbox: uncheck a demonstration. Bind with both off has an empty S and
        fails. Compose stays wrong even with both on — relocation was never in S.
      </p>

      <div className="ws-block stage">
        <div className="triad">
          <GridView grid={task.query} label="Query x★" size="lg" />
          <GridView
            grid={step.decoded}
            label={`H₍${step.r}₎  decoded`}
            size="lg"
            changed={step.cellChanged}
            highlight={step.correct ? "match" : "miss"}
          />
          <GridView grid={task.truth} label="Ground truth" size="lg" />
        </div>
        <SynapseMap S={step.S} caption={synCaption} />
      </div>

      <div className="ws-block meters">
        <div>
          <div className="meter-k">Latent steps R</div>
          <div className="meter-v">{step.r}</div>
        </div>
        <div>
          <div className="meter-k">
            {task.id === "settle" ? "Unsupported masses" : "Hamming vs truth"}
          </div>
          <div className="meter-v">{step.energy}</div>
        </div>
        <div>
          <div className="meter-k">CoT tokens emitted</div>
          <div className="meter-v meter-zero">0</div>
        </div>
        <div>
          <div className="meter-k">Verdict</div>
          <div className={`meter-v text-sm ${step.correct ? "ok" : "miss"}`}>{verdict}</div>
        </div>
      </div>

      <div className="ws-block filmstrip">
        <div className="film-head">
          <span>Each frame is one real update of this toy. Already running.</span>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setR(0);
              setPlaying(true);
            }}
          >
            {playing ? "Playing" : "Replay"}
          </button>
        </div>
        <div className="film-track" role="group" aria-label="Latent iteration filmstrip">
          {snaps.map((s) => (
            <button
              key={s.r}
              type="button"
              className={`film-frame${s.r === step.r ? " is-on" : ""}`}
              onClick={() => scrub(s.r)}
              aria-pressed={s.r === step.r}
              aria-label={`R = ${s.r}`}
            >
              <GridView grid={s.decoded} size="sm" />
              <span className="film-r">R {s.r}</span>
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={task.maxR}
          step={1}
          value={step.r}
          onChange={(e) => scrub(Number(e.target.value))}
          aria-label="Latent iteration R"
        />
      </div>

      <p className="ws-block paper-note">
        <Evidence>Toy · labeled</Evidence> {task.paperNote}
      </p>
    </div>
  );
}
