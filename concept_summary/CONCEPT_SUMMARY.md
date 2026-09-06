# Latent Test-Time Compute in BDH-CQ: Inference-Time Scaling Without a Scratchpad

**DataForge 2026 · Pathway Track — One-Page Concept Summary**

---

## The Design Pressure

Standard Transformers spend a fixed amount of computation at inference: one forward pass, one output. When tasks require more deliberation — multi-step rule induction, constraint satisfaction — the model has no mechanism to allocate extra work. Token-budget scaling (OpenAI o1, DeepSeek R1) addresses this by generating verbal reasoning tokens before answering: more tokens, more accuracy, higher cost per task and higher latency. The question BDH-CQ poses is whether inference-time compute can be scaled *inside* a latent workspace — refining a hidden state iteratively — without emitting any reasoning tokens.

---

## The Mechanism

BDH-CQ (Engdahl et al., arXiv:2608.09888, Aug 2026) is a 150M post-Transformer system built on the Dragon Hatchling (BDH) family. Its two-stage inference procedure is:

**Write phase:** Each demonstration is encoded and accumulated into a fixed-size recurrent associative state S. The paper names the linear-attention special case: `S_t = S_{t-1} + U_θ(D_t)`. Parameters θ do not move; U_θ is a learned demonstration encoder.

**Latent iterate phase:** The query is encoded into a hidden workspace H, then refined: `H_{r+1} = F_θ(H_r, S_K)`. After R iterations, the answer is decoded from H_R. No intermediate token is emitted at any step. The exact dimensions of F_θ and the internal R at each effort setting are proprietary (§3.3).

This replaces the Transformer's growing KV cache (O(sequence length) memory) with a fixed associative state, trading eviction-free constant memory for potential superposition interference.

---

## The Evidence

On ARC-AGI-1 public evaluation (400 tasks, Chollet 2019):

| Effort | pass@2 | Cost/task | CoT tokens |
|---|---|---|---|
| LOW | 21.0% | ~$0.00055 | 0 |
| MEDIUM | 27.0% | ~$0.00062 | 0 |
| HIGH | **29.5%** | **$0.0007** | **0** |

Source: Table 5 and §5 of arXiv:2608.09888. The 21→29.5 jump is a **training-and-select protocol**: the model is trained at multiple effort levels and the level is selected at inference. It is *not* "turn R up on one frozen checkpoint" — §6.6 shows that MIN vs STANDARD on the deployed system is statistically unresolved (McNemar p=0.167, 111 vs 118 solved). An independent black-box audit reproduced the 29.5% pass@2 without weights.

The HIGH point at $0.0007/task sits to the left of every plotted system of equal-or-higher accuracy on the 4 Aug 2026 ARC Prize leaderboard plane. GPT-5.6 Luna (Low) reaches 34.2% at $0.040 — more accurate, ~57× costlier at listed price. HRM ($1.48/task) and TRM ($1.76/task) are transductive solvers that run a backward pass on evaluation tasks before scoring — a different regime entirely.

---

## Where It Fails

The paper's own controlled experiments (§6.3, Table 4, Appendix A.2) are explicit:

- **Color-swap ∘ relocation:** 0/72 solved. Iteration cannot compose operators that were not bound.
- **Generated gravity-and-stacking:** 2.9% solve rate. A locally-iterated rule can settle gravity; the trained system often cannot.
- **ConceptARC Copy and Order families:** 2/10 each (Table 2).

These are not edge cases discovered post-hoc — they are published by the authors and included in this explainer's Capability Atlas section. The observability cost is real: when HIGH is wrong, there is no chain of thought to audit.

---

## Situating BDH-CQ

| Approach | Extra compute | Eval backward pass | Latency & Cost | ARC-AGI-1 pass@2 |
|---|---|---|---|---|
| CoT / token-budget | Decoded tokens | No | High / $0.040 | 34.2% (Luna Low) |
| HRM / TRM | Per-puzzle optimization | **Yes** | Very high / $1.50+ | ~32–45% (transductive) |
| BDH-CQ | Latent iterations of H | No | Low (0.85s) / **$0.0007** | **29.5%** (HIGH, in-context) |

---

## Maturity Assessment: 4/10 and Largest Gaps

We assess BDH-CQ's maturity as an architecture-native reasoning system at **4/10**:
- **Demonstrated advantages:** Verified 150M in-context solver on ARC-AGI-1 at ultra-low cost ($0.0007/task), constant-size memory footprint, and reported early pretraining scaling from 1B to 600B parameters with Amazon SageMaker HyperPod integration.
- **Largest remaining gaps:**
  1. *Proprietary operators:* $U_\theta$ and $F_\theta$ remain undisclosed, precluding independent replication from the paper alone.
  2. *Zero observability:* Latent states cannot be inspected like a token transcript when failures occur.
  3. *Unbound primitives:* Extra latent compute cannot invent operators that were not bound during demonstration ingestion (e.g. 0/72 on color-swap + relocation).

---

## Sources

1. Engdahl et al. *BDH-CQ.* arXiv:2608.09888. 2026.
2. Kosowski et al. *The Dragon Hatchling.* arXiv:2509.26507. 2025.
3. Snell et al. *Scaling LLM Test-Time Compute Optimally.* NeurIPS 2024. arXiv:2408.03314.
4. Geiping et al. arXiv:2502.05171. 2025.
5. Hao et al. (CoCoNuT). arXiv:2412.06769. 2024.
6. Wang et al. (HRM). arXiv:2506.21734. 2025.
7. Chollet. arXiv:1911.01547. 2019.

*~780 words. Every figure is sourced to the primary paper section listed above.*
