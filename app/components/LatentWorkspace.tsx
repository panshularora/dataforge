"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import GridView from "./GridView";
import Evidence from "./Evidence";
import {
  TASKS,
  runToy,
  type ToyKind,
  type ToyTask,
} from "@/lib/latentEngine";

gsap.registerPlugin(useGSAP);

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
  const snaps = useMemo(() => runToy(task), [task]);
  const [r, setR] = useState(0);
  const [playing, setPlaying] = useState(autoPlayOnMount);
  const step = snaps[Math.min(r, snaps.length - 1)];

  useEffect(() => {
    setR(0);
    setPlaying(true);
  }, [taskId]);

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

  useGSAP(
    () => {
      if (!root.current) return;
      gsap.from(".ws-block", {
        opacity: 0,
        y: 16,
        duration: 0.45,
        stagger: 0.06,
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

  return (
    <div ref={root} className="workspace">
      <div className="ws-block task-switch" role="tablist" aria-label="Toy task">
        {TASKS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === taskId}
            className={t.id === taskId ? "is-on" : ""}
            onClick={() => setTaskId(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <p className="ws-block lead">{task.whatItTests}</p>

      <div className="ws-block demo-row">
        {task.demos.map((d, i) => (
          <div key={i} className="demo-pair">
            <GridView grid={d.input} label={`Demo ${i + 1} in`} size="sm" />
            <span className="pair-arrow" aria-hidden>
              →
            </span>
            <GridView grid={d.output} label="out" size="sm" />
          </div>
        ))}
      </div>

      <div className="ws-block triad">
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
          <span>Scrub the latent film. Each frame is one real update of this toy.</span>
          <button type="button" className="text-btn" onClick={() => { setR(0); setPlaying(true); }}>
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
