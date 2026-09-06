"use client";

import dynamic from "next/dynamic";
import Evidence from "./components/Evidence";
import { CLAIM, HEADLINE, LUNA, PAPER, TABLE5 } from "@/lib/published";

const LatentWorkspace = dynamic(() => import("./components/LatentWorkspace"), { ssr: false });
const EffortScale = dynamic(() => import("./components/EffortScale"), { ssr: false });
const ParetoMap = dynamic(() => import("./components/ParetoMap"), { ssr: false });
const CapabilityAtlas = dynamic(() => import("./components/CapabilityAtlas"), { ssr: false });
const BDHFabric = dynamic(() => import("./components/BDHFabric"), { ssr: false });

const NAV = [
  { href: "#claim", label: "Claim" },
  { href: "#toy", label: "Live toy" },
  { href: "#effort", label: "Table 5" },
  { href: "#pareto", label: "Frontier" },
  { href: "#atlas", label: "Failures" },
  { href: "#bdh", label: "BDH" },
  { href: "#limits", label: "Limits" },
];

export default function Home() {
  return (
    <div className="shell">
      <a href="#toy" className="skip">Skip to live toy</a>
      <header className="mast">
        <span>DataForge 2026 · Pathway track</span>
        <nav aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero" id="claim">
        <p className="kicker">Inference-time scaling without a scratchpad</p>
        <h1>Zero tokens. More compute.</h1>
        <p className="claim">{CLAIM.sentence}</p>
        <p className="prose">
          <Evidence>Paper · abstract, Table 5, §5</Evidence>
          The filmstrip below is already running. Drag it. Tokens stay at zero.
        </p>
        <div className="hero-stats">
          <div>
            <strong>21 → 29.5%</strong>
            <span>LOW → HIGH pass@2 · 400 tasks</span>
          </div>
          <div>
            <strong>$0.0007</strong>
            <span>HIGH cost / task · 0.85 H200-s</span>
          </div>
          <div>
            <strong>0</strong>
            <span>verbal CoT tokens at every effort</span>
          </div>
          <div>
            <strong>150M</strong>
            <span>parameters · not a 600B demo</span>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <a href="/concept_summary.pdf" target="_blank" rel="noreferrer" className="text-btn" style={{ textDecoration: "none" }}>
            ↓ 1-Page Summary (PDF)
          </a>
          <a href="/blog.pdf" target="_blank" rel="noreferrer" className="text-btn" style={{ textDecoration: "none" }}>
            ↓ Technical Blog (PDF)
          </a>
          <a href="https://github.com/panshularora/dataforge" target="_blank" rel="noreferrer" className="text-btn" style={{ textDecoration: "none" }}>
            GitHub
          </a>
          <a href="https://dataforge-virid-delta.vercel.app" target="_blank" rel="noreferrer" className="text-btn" style={{ textDecoration: "none" }}>
            Live
          </a>
        </div>

        <dl className="learner">
          <div>
            <dt>Audience</dt>
            <dd>ML practitioners who know Transformers and have heard of o1-style token budgets.</dd>
            <dt>Prerequisite</dt>
            <dd>Attention as retrieval. ARC grids are explained in place.</dd>
          </div>
          <div>
            <dt>After one minute</dt>
            <dd>
              You can say: extra R finishes an operator that is already local;
              it cannot invent relocation; Table 5 is 21 / 27 / 29.5 at $0.0007;
              Luna is more accurate and costlier.
            </dd>
            <dt>Falsify it</dt>
            <dd>
              Uncheck both Bind demos — S empties, the read fails. Open Compose —
              R does not help. If HIGH had not beaten LOW, the published claim
              would be false.
            </dd>
          </div>
        </dl>
      </section>

      <section className="chapter" id="toy">
        <p className="chap-id">01 · Substrate</p>
        <h2>Change R. Watch the hidden state, not a caption.</h2>
        <div className="prose">
          <p>
            BDH-CQ writes demonstrations into a recurrent state S, then iterates a
            latent workspace H before decoding. The official F<sub>θ</sub> is not
            public. This toy is the linear-attention special case the paper names,
            plus a local settle rule, so the variable you move is a real update —
            not a JSON lookup of 85%.
          </p>
          <p>
            Three tasks, one lesson each: iteration can finish an operator that is
            already local; a consistent map needs almost no extra R; missing
            composition does not appear just because you wait longer.
          </p>
        </div>
        <LatentWorkspace />
      </section>

      <section className="chapter" id="effort">
        <p className="chap-id">02 · Published scale</p>
        <h2>LOW, MEDIUM, HIGH — not 1× / 4× / 16×.</h2>
        <div className="prose">
          <p>
            A common misreading is to invent a 53% → 85% ARC curve or to label
            HIGH as “16 passes.” Neither figure is in the paper. Table 5 is.
            Internal iteration counts remain proprietary.
          </p>
        </div>
        <EffortScale />
      </section>

      <section className="chapter" id="pareto">
        <p className="chap-id">03 · Pareto</p>
        <h2>Cheaper than Luna. Not more accurate than Luna.</h2>
        <div className="prose">
          <p>
            {LUNA.name} scores {(LUNA.passAt2 * 100).toFixed(1)}% at $
            {LUNA.leaderboardCostUsd.toFixed(3)} on the {LUNA.leaderboardDate} ARC
            Prize plane. BDH-CQ HIGH scores {(HEADLINE.passAt2 * 100).toFixed(1)}% at $
            {HEADLINE.costUsd.toFixed(4)}. The frontier claim is cost at a given
            accuracy, not a new accuracy record. Snell et al. (2024) measured
            token-budget scaling on MATH/GSM8K — those points do not belong on
            this ARC chart.
          </p>
        </div>
        <ParetoMap />
      </section>

      <section className="chapter" id="atlas">
        <p className="chap-id">04 · Capability</p>
        <h2>Where latent compute cannot buy the missing operator.</h2>
        <CapabilityAtlas />
      </section>

      <section className="chapter" id="bdh">
        <p className="chap-id">05 · BDH module</p>
        <h2>Memory, adaptation, and inference share one fabric.</h2>
        <div className="prose">
          <p>
            Dragon Hatchling (BDH) is a post-Transformer sequence model: sparse
            non-negative activations, Hebbian synaptic working memory, a
            GPU-friendly ReLU-low-rank + linear-attention form. BDH-CQ is a later
            system in that family that learns from demonstrations at inference
            and reasons without a written chain of thought. Relevance is not
            equal: BDH supplies the fabric; BDH-CQ is the effort-scaled reasoner
            this explainer is about.
          </p>
        </div>
        <BDHFabric />
      </section>

      <section className="chapter" id="limits">
        <p className="chap-id">06 · Limits</p>
        <h2>What this does not show.</h2>
        <div className="prose">
          <p>
            Latent reasoning is cheaper and mute. When HIGH is wrong, there is no
            trace to read. The paper’s own composition and gravity results are the
            failure cases — not an afterthought. Pretraining from 1B to 600B is
            reported as early scaling of the architecture, not the 150M ARC
            system on this page.
          </p>
          <p>
            Independent black-box audit reproduced 29.5% pass@2 without weights.
            The recipe still cannot be reimplemented from the paper: U<sub>θ</sub>{" "}
            and F<sub>θ</sub> are unspecified. This explainer does not pretend
            otherwise.
          </p>
          <p>
            <strong>Maturity assessment: 4/10.</strong> Demonstrates an ultra-low-cost ($0.0007)
            in-context baseline on ARC-AGI-1 and reported 1B–600B pretraining scaling with
            Amazon SageMaker HyperPod integration. The largest remaining gaps are: (1) proprietary
            update operators; (2) unobservable latent states; (3) failure to compose operators
            that were not bound during demonstration ingestion.
          </p>
          <p>
            <strong>Sixty-second test.</strong> Open the live toy on Settle. Scrub
            R from 0 to 2. Unsupported masses go to zero and the grid matches
            truth — still 0 tokens. Switch to Compose. Scrub to R = 4. It stays
            wrong. Then open Table 5: LOW 21%, HIGH {(TABLE5.high.passAt2 * 100).toFixed(1)}%,
            $0.0007. If you can say those two sentences, the artifact did its job.
          </p>
        </div>

        <h2 style={{ marginTop: "2.5rem" }}>Sources</h2>
        <ol className="sources">
          <li>
            <a href={PAPER.bdhCq.href} target="_blank" rel="noreferrer">
              {PAPER.bdhCq.authors}. {PAPER.bdhCq.title}. arXiv:{PAPER.bdhCq.arxiv}. {PAPER.bdhCq.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.bdh.href} target="_blank" rel="noreferrer">
              {PAPER.bdh.authors}. {PAPER.bdh.title}. arXiv:{PAPER.bdh.arxiv}. {PAPER.bdh.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.geiping.href} target="_blank" rel="noreferrer">
              {PAPER.geiping.authors}. {PAPER.geiping.title}. arXiv:{PAPER.geiping.arxiv}. {PAPER.geiping.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.coconut.href} target="_blank" rel="noreferrer">
              {PAPER.coconut.authors}. {PAPER.coconut.title}. arXiv:{PAPER.coconut.arxiv}. {PAPER.coconut.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.snell.href} target="_blank" rel="noreferrer">
              {PAPER.snell.authors}. {PAPER.snell.title}. arXiv:{PAPER.snell.arxiv}. {PAPER.snell.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.wei.href} target="_blank" rel="noreferrer">
              {PAPER.wei.authors}. {PAPER.wei.title}. arXiv:{PAPER.wei.arxiv}. {PAPER.wei.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.hrm.href} target="_blank" rel="noreferrer">
              {PAPER.hrm.authors}. {PAPER.hrm.title}. arXiv:{PAPER.hrm.arxiv}. {PAPER.hrm.year}.
            </a>
          </li>
          <li>
            <a href={PAPER.chollet.href} target="_blank" rel="noreferrer">
              {PAPER.chollet.authors}. {PAPER.chollet.title}. arXiv:{PAPER.chollet.arxiv}. {PAPER.chollet.year}.
            </a>
          </li>
        </ol>
      </section>

      <footer className="foot">
        DataForge 2026 · IIT Kharagpur · Pathway track. Toy compute runs in the
        browser. Published numbers are from arXiv:2608.09888 and cited leaderboard
        snapshots. AI assistance: DISCLOSURE.md.
      </footer>
    </div>
  );
}
