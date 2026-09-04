# Zero tokens. More compute.

**DataForge 2026 · IIT Kharagpur · Pathway track**

Interactive explainer of **inference-time scaling** in **BDH-CQ**: extra test-time compute as latent iterations, not chain-of-thought tokens.

> **Claim.** A 150M BDH-CQ system raises ARC-AGI-1 pass@2 from 21% (LOW) to 29.5% (HIGH) by iterating a latent workspace after writing demonstrations into recurrent memory — with zero verbalized chain-of-thought tokens — and the HIGH point sits at $0.0007/task, beyond the previously reported cost–accuracy Pareto frontier.

**Live artifact:** deploy with `npx vercel --prod` and paste the URL here  
**Source:** https://github.com/panshularora/dataforge-2026-bdh-cq

---

## Learner

ML practitioners and advanced CS students who know Transformers and have heard of o1-style token budgets. Optional: ARC-AGI.

### After using it you should be able to

1. State the claim above, including the 21 / 27 / 29.5 split and $0.0007.
2. Contrast latent effort (BDH-CQ) with token-budget scaling (CoT / o1) and with transductive ARC solvers (HRM / TRM).
3. Write the published system-level equations S<sub>t</sub>, H<sub>r</sub> and say what is proprietary.
4. Explain why Luna can be *more accurate* while BDH-CQ still claims the cost frontier.
5. Name one failure that more R does not fix (color-swap ∘ relocation = 0/72).
6. Distinguish Table 5 (train-and-select effort) from §6.6 (MIN vs STANDARD, p = 0.167).

### Sixty-second test

Open Settle. Scrub R = 0 → 2. The grid matches truth; tokens stay 0. Open Compose. Scrub to R = 4. It stays wrong. Read Table 5: LOW 21%, HIGH 29.5%, $0.0007.

---

## What is live, precomputed, toy, or schematic

| Surface | Kind | Source |
|---|---|---|
| Settle / Bind / Compose filmstrip | **Live JS** | `lib/latentEngine.ts` — Hebbian color map + one-row fall. Labeled toy. |
| Table 5 bars | Precomputed | arXiv:2608.09888 Table 5 |
| Pareto points | Precomputed | §5, Fig. 2, ARC Prize 4 Aug 2026 |
| ConceptARC bars | Precomputed | Table 2 |
| Sparse neuron field | Schematic | Illustrative of reported ~5% sparsity, not a recorded map |
| KV vs fixed-state KB | Schematic | Toy d=256, single layer; not a published memory trace |

Internal iteration counts of BDH-CQ are **not published**. This explainer never maps HIGH to “16×.”

---

## Architecture

```
app/page.tsx                 narrative
app/components/
  LatentWorkspace.tsx        live toy (the substrate)
  EffortScale.tsx            Table 5 + §6.6 caveat
  ParetoMap.tsx              ARC cost plane (no mixed benchmarks)
  CapabilityAtlas.tsx        Table 2 / 4 / Appendix A.2
  BDHFabric.tsx              equations + schematic field
lib/
  published.ts               every cited number
  latentEngine.ts            actual updates
  arcColors.ts               official ARC palette
public/data/                 JSON copies of the same figures
```

---

## Setup

Node 18+ / npm 9+.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run pdfs         # concept summary + blog PDFs
```

Reproduce numbers: open `lib/published.ts` or `public/data/*.json`. Each field names the paper section. Confirm against [arXiv:2608.09888](https://arxiv.org/abs/2608.09888) Table 5, §5, §6.3, §6.6, Tables 2 and 4, Appendix A.2.

---

## Primary papers (2022–2026)

1. Engdahl et al. *BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.* 2026. [arXiv:2608.09888](https://arxiv.org/abs/2608.09888)
2. Kosowski et al. *The Dragon Hatchling.* 2025. [arXiv:2509.26507](https://arxiv.org/abs/2509.26507)
3. Geiping et al. *Scaling up Test-Time Compute with Latent Reasoning.* 2025. [arXiv:2502.05171](https://arxiv.org/abs/2502.05171)
4. Hao et al. *Coconut.* 2024. [arXiv:2412.06769](https://arxiv.org/abs/2412.06769)
5. Snell et al. *Scaling LLM Test-Time Compute Optimally.* 2024. [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
6. Wei et al. *Chain-of-Thought Prompting.* 2022. [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

Chollet 2019 defines ARC; it is cited as the benchmark paper, not as a 2022–2026 concept paper.

---

## Package contents

- Public artifact URL (after deploy)
- This repository
- `concept_summary/concept_summary.pdf`
- `blog/blog.pdf`
- `DISCLOSURE.md` (AI, code, data, licenses)
- `LICENSE` (MIT)

---

## Limitations

- No BDH-CQ weights. Toy ≠ official F_θ.
- Table 5 effort is a training-and-select protocol; §6.6 MIN vs STANDARD on the deployed system is −1.75 pp and not significant.
- HIGH is less accurate than Luna Low and much cheaper. Do not invert that.
- Gravity in the toy is a local fall rule. Generated gravity-and-stacking is 2.9% for the real system.

Credits and licenses: `DISCLOSURE.md`.
