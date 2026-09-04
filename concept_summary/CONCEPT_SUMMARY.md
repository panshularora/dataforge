# Inference-time scaling without a verbal scratchpad

**One-page concept summary — DataForge 2026 · Pathway track**

Chain-of-thought allocates extra inference compute by decoding tokens and feeding them back. That works, and it is expensive: every intermediate state must pass through a vocabulary, an autoregressive step, and a growing context. **Inference-time scaling via latent computation** spends the same budget inside a recurrent hidden state and emits only the answer. The current reason it matters is that 2024–2026 reasoning systems (o1-class token budgets, Coconut-style continuous thoughts, recurrent-depth LMs, HRM/TRM) all buy accuracy with extra test-time work, but they do not buy it the same way.

**Mechanism.** BDH-CQ (Engdahl et al., 2026) is a 150M-parameter reasoner in the Dragon Hatchling (BDH) family. Demonstrations of an unseen task update a recurrent associative memory `S_t = U_θ(S_{t-1}, D_t)` with θ frozen. After K examples, a latent workspace is encoded and iterated `H_{r+1} = F_θ(H_r, S_K)`, then decoded. No evaluation-task backward pass, no puzzle identity embedding, no verbal trace. Linear attention is the special case `S_t = S_{t-1} + U_θ(D_t)`. Dimensions of `U_θ` and `F_θ` are proprietary; this is a published interface, not a full recipe. BDH itself is not an SSM in the Mamba sense: BDH-GPU is ReLU-low-rank communication plus linear attention, with Hebbian synaptic working memory, ~5% sparse non-negative activations, and reported monosemantic synapses (Kosowski et al., 2025).

**What changes.** Extra compute is a deeper unrolling of H, not a longer string. Memory stays fixed-size; cost and latency do not inherit decode-length. The trade: the trace is unobservable, superposition can interfere, and composition is not guaranteed just because R increased.

**Evidence (labeled).** On the 400-task public ARC-AGI-1 split, HIGH effort is **118/400 = 29.5% pass@2** (Wilson 25.2–34.2%) at a computed **$0.00070/task** (0.85 H200-s at $3/h). pass@1 is 97/400 = 24.25%. Table 5, on a model trained with multiple latent-reasoning levels, reports **LOW 21%, MEDIUM 27%, HIGH 29.5%**, all with zero CoT tokens. A black-box audit (Kinas / Zhong) reproduced 29.5% without weights. This is developer-reported hardware cost plus an independent score check — not an independent reimplementation.

**Comparators that actually matter.** GPT-5.6 Luna (Low) is **more accurate** (34.2%) and, on the 4 Aug 2026 ARC Prize listing, **57× costlier** at $0.040; after the 30 Jul 80% API cut the paper still reports ~11×. HRM and TRM report strong ARC numbers via transductive optimization of the evaluation puzzle (identity embeddings, augmentation, a backward pass) at $1.48 and $1.76 per task. BDH-CQ’s claim is the in-context, no-backward-pass cost frontier — not a higher raw score than Luna, and not the same protocol as HRM/TRM. Snell et al. (2024) is the right citation for *token-budget* scaling laws; those MATH/GSM8K curves must not be drawn on the ARC plane.

**Where it is weaker.** ConceptARC strict-task pass@2 is 59.4% while pair accuracy is 77.9%: many tasks are only partly solved. Copy and Order are 2/10; FilledNotFilled and TopBottom2D are 9/10. Dense color maps bind 96/96; color-swap composed with relocation is **0/72**. Generated gravity-and-stacking is 2.9% against flood-fill 68.6%. §6.6 MIN vs STANDARD on the deployed system is 111 vs 118 / 400 (p = 0.167): the large Table 5 jump is a train-and-select protocol, not a proven one-checkpoint slider.

**Maturity.** Early BDH pretraining is reported from 1B to 600B with Transformer-like scaling; that is not the 150M ARC system. AWS/SageMaker integration is a deployment partnership, not an independent scientific evaluation.

**Limitation to keep.** Latent effort only refines an operator the memory already bound. More R will not invent a missing composition. Observability is the other tax: when HIGH fails, there is no chain of thought to read.

**Continue:** arXiv:2608.09888 (BDH-CQ); arXiv:2509.26507 (BDH); Geiping et al. 2025 (recurrent depth); Hao et al. 2024 (Coconut); Snell et al. 2024.
