# Inference-Time Scaling Without a Scratchpad
### DataForge 2026 · Pathway Track · Interactive Explainer

> **Central Claim:** A 150M BDH-CQ system raises ARC-AGI-1 pass@2 from 21% (LOW) to 29.5% (HIGH) by iterating a latent workspace after writing demonstrations into recurrent memory — with zero verbalized chain-of-thought tokens — and the HIGH point sits at $0.0007/task, beyond the previously reported cost–accuracy Pareto frontier.
>
> *Falsifiable: if HIGH did not beat LOW on the same 400-task public split, or if the HIGH cost point were not cheaper than every plotted system of equal-or-higher accuracy on the 4 Aug 2026 ARC Prize plane, the claim would be false.*

**Primary source:** Engdahl et al., "BDH-CQ: In-Context Learning with Recurrent Latent Reasoning", arXiv:2608.09888, 10 Aug 2026.

**Live demo:** [https://dataforge-virid-delta.vercel.app](https://dataforge-virid-delta.vercel.app)  
**Source code:** [https://github.com/panshularora/dataforge](https://github.com/panshularora/dataforge)  
**One-page concept summary (PDF):** [concept_summary/concept_summary.pdf](concept_summary/concept_summary.pdf)  
**Technical blog (PDF):** [blog/blog.pdf](blog/blog.pdf)

---

## 🎯 What This Explainer Teaches

### The One-Sentence Claim
> BDH-CQ raises ARC-AGI-1 pass@2 from 21% to 29.5% by iterating a latent workspace — no chain-of-thought tokens, zero backward pass on evaluation tasks.

### Intended Audience
ML practitioners, NeurIPS attendees, and advanced CS students familiar with Transformers and attention mechanisms.

### Prerequisites
- Transformers and self-attention (basic)
- ARC-AGI benchmark format (helpful but explained inline)

### Learning Objectives
After using this explainer, a learner should be able to:
1. State the falsifiable claim about BDH-CQ effort scaling and identify which number would disprove it
2. Contrast latent workspace iteration with token-budget (CoT) and transductive (per-puzzle optimization) approaches
3. Explain why the Bind toy solves at R=1 but the Settle toy needs R≥2 — and what that implies about operators
4. Read the Compose toy's permanent failure as evidence that iteration cannot substitute for a missing operator
5. Locate the HIGH point on the cost-accuracy Pareto plane relative to Luna and explain the frontier claim correctly
6. Identify two published composition failure modes and one failure family from ConceptARC

---

## 🗂️ Architecture of the Artifact

```
app/
├── page.tsx                  # Main page — 6 sections + sources
├── layout.tsx                # Root layout, fonts (Syne + Atkinson + IBM Plex Mono)
├── globals.css               # Full editorial design system
└── components/
    ├── LatentWorkspace.tsx   # Sect 01: Live toy — Settle / Bind / Compose
    ├── EffortScale.tsx       # Sect 02: Table 5 bar chart — LOW/MEDIUM/HIGH
    ├── ParetoMap.tsx         # Sect 03: Cost-accuracy Pareto plane
    ├── CapabilityAtlas.tsx   # Sect 04: ConceptARC family atlas + failure grid
    ├── BDHFabric.tsx         # Sect 05: BDH equations, sparse field, memory compare
    ├── GridView.tsx          # Shared: ARC grid renderer with change highlighting
    └── Evidence.tsx          # Shared: inline evidence badge component

lib/
├── latentEngine.ts           # Toy substrate — real linear-attention special case
├── published.ts              # Single source of truth for all paper numbers
└── arcColors.ts              # ARC color palette
```

### Component Roles

| Component | What it teaches | Live vs Precomputed |
|---|---|---|
| `LatentWorkspace` | Latent iteration as real computation | **Live** (toy runs in browser, real updates) |
| `EffortScale` | Published LOW/MEDIUM/HIGH numbers | Precomputed (Table 5, §5) |
| `ParetoMap` | Cost-accuracy frontier claim | Precomputed (§5, leaderboard snapshot) |
| `CapabilityAtlas` | Where the system fails | Precomputed (Table 2, Table 4, App A.2) |
| `BDHFabric` | Architecture equations + memory compare | Live (slider) + precomputed (equations) |

### What is Live vs Precomputed
- **Live computation:** The toy in `LatentWorkspace` runs real updates (`fallOnce`, `applyColorMap`) in the browser. The neuron field in `BDHFabric` responds to the novelty-pulse slider. The memory comparison updates with the sequence-length slider.
- **Precomputed/published:** All accuracy figures, cost figures, ConceptARC results, composition table entries. Each is sourced from `lib/published.ts`, which cites the specific section of arXiv:2608.09888.
- **Labeled inline:** Every precomputed figure carries an `Evidence` badge citing paper section. Every toy carries a `paperNote` explaining what it is and what it is not.

---

## 🚀 Setup & Reproduction

```bash
git clone https://github.com/panshularora/dataforge.git
cd dataforge
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run pdfs       # generate concept-summary.pdf and blog.pdf (requires reportlab)
npm run check:engine  # verify toy engine logic
```

### How to Reproduce Results
All numerical results in `lib/published.ts` are traceable:
- `HEADLINE.*` → arXiv:2608.09888, §5 and abstract
- `TABLE5.*` → arXiv:2608.09888, Table 5
- `SECTION_66.*` → arXiv:2608.09888, §6.6
- `CONCEPTARC.*` → arXiv:2608.09888, Table 2
- `CONTROLLED.*` → arXiv:2608.09888, §6.3, Table 4, Appendix A.2
- `LUNA.*` → ARC Prize leaderboard, 4 Aug 2026 snapshot

---

## 📚 Primary Sources

1. **Engdahl et al.** *BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.* arXiv:2608.09888. 2026.
2. **Kosowski et al.** *The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain.* arXiv:2509.26507. 2025.
3. **Snell et al.** *Scaling LLM Test-Time Compute Optimally.* NeurIPS 2024. arXiv:2408.03314.
4. **Geiping et al.** *Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach.* 2025. arXiv:2502.05171.
5. **Hao et al. (CoCoNuT).** *Training LLMs to Reason in a Continuous Latent Space.* 2024. arXiv:2412.06769.
6. **Wei et al.** *Chain-of-Thought Prompting Elicits Reasoning in LLMs.* NeurIPS 2022. arXiv:2201.11903.
7. **Wang et al. (HRM).** *Hierarchical Reasoning Model.* 2025. arXiv:2506.21734.
8. **Chollet.** *On the Measure of Intelligence.* 2019. arXiv:1911.01547.

---

## ⚖️ Credits & Licenses

- **Framework:** Next.js (MIT) · React (MIT) · Tailwind CSS (MIT) · GSAP (GSAP Standard License)
- **Fonts:** Syne (OFL) · Atkinson Hyperlegible (OFL) · IBM Plex Mono (OFL)
- **Data:** All from cited papers (public research). No proprietary weights or checkpoints used.
- **App code:** Original, written for this submission (MIT)

See `DISCLOSURE.md` for full AI assistance and license disclosure.

---

## ⚠️ Known Limitations

1. **F_θ / U_θ are proprietary** — the toy implements the linear-attention special case named in §3.2, not the actual BDH-CQ update functions
2. **21→29.5% is a training+select protocol** (Table 5), not "turn R up on one frozen checkpoint" — §6.6 shows MIN vs STANDARD is statistically unresolved (McNemar p=0.167)
3. **Independent black-box audit** reproduced 29.5% without weights, but the recipe cannot be reimplemented from the paper
4. **Composition and gravity failures** are the system's own documented failure modes, included in the CapabilityAtlas section
5. **Luna (34.2% pass@2)** is more accurate than BDH-CQ HIGH (29.5%) — the frontier claim is about cost, not top accuracy
