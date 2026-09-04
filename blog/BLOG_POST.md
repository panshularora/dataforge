# The 21 percent that actually matters

**DataForge 2026 · Pathway track · companion to the interactive explainer**

For a year the public story of “test-time compute” has been a story about words. o1-class systems spend more decode steps; the answer gets better; the bill grows with the transcript. Snell et al. (2024) made that trade-off quantitative on MATH and GSM8K: allocate the token budget on purpose, and you can beat a larger model that answers immediately.

BDH-CQ asks a narrower, meaner question: **what if the extra work never becomes text?**

## Two knobs, not one

Chain-of-thought is a computational workspace that happens to be a language. Coconut (Hao et al., 2024) already showed that a Transformer can recycle its last hidden state instead of a token; Geiping et al. (2025) showed that looping a shared block (recurrent depth) is another way to buy test-time FLOPs without a longer string. HRM and TRM push a different button on ARC: they *optimize* on the evaluation puzzle — augmentations, identity embeddings, a backward pass — and then vote. That is test-time compute too. It is not in-context learning.

BDH-CQ is built to sit in the remaining cell of that table: **demonstrations write a recurrent state; the query is solved by iterating a latent workspace; parameters do not move; no CoT is emitted.**

The published interface is short.

```
S_t     = U_θ(S_{t-1}, D_t)
H_0     = E_θ(x★, S_K)
H_{r+1} = F_θ(H_r, S_K)
ŷ       = G_θ(H_R)
```

Linear attention is named as the special case `S_t = S_{t-1} + U_θ(D_t)`. Everything about the sizes of those maps is withheld. That sentence is not a hedge we added for the hackathon. It is in the paper.

BDH, the architecture family underneath, is a separate claim: scale-free graph of neuron particles, Hebbian synaptic working memory, sparse non-negative activations, a GPU form that is ReLU-low-rank plus linear attention. It is not Mamba. Calling it an SSM in the Mamba sense is a classification error the Pathway brief explicitly forbids.

## The number that survived contact with the paper

A 150M configuration scores **29.5% pass@2** on the 400-task public ARC-AGI-1 split at a computed **$0.00070 per task**. pass@1 is 24.25%. An independent black-box audit reproduced the 29.5 without weights.

Table 5 is the scaling result this explainer is about:

| Effort | pass@2 | Cost vs HIGH |
|---|---|---|
| LOW | 21% | −22% |
| MEDIUM | 27% | −11% |
| HIGH | 29.5% | 0 |

Zero CoT tokens in every row. The paper does **not** tell you that HIGH means 16 recurrent steps. Anyone who writes 1× / 4× / 16× on a BDH-CQ chart invented it.

Two caveats that change how you teach this:

1. **Table 5 trains at multiple effort levels**, then selects the level at inference. §6.6 measures MIN vs STANDARD on the *deployed* system: 111 vs 118 / 400, McNemar p = 0.167. Unresolved. Do not narrate 21 → 29.5 as “drag a slider on one frozen checkpoint.”
2. **Luna is more accurate.** GPT-5.6 Luna (Low) is 34.2% at $0.040 on the 4 Aug 2026 ARC Prize listing. BDH-CQ’s Pareto claim is the left edge of that plane (57× cheaper at listed price; ~11× after the July 80% API cut), not a new accuracy record. HRM ($1.48) and TRM ($1.76) are off this plane because they optimize the test puzzle.

If you mix Snell’s MATH curves onto this ARC chart you are no longer talking about the paper.

## What extra R can and cannot do

The controlled section is the part most dashboards skip, and it is the part that makes the claim falsifiable in a studio.

- Dense color permutations introduced only in context: **96/96** held-out outputs.
- Rotation composed with relocation: **72/72**. Reflection ∘ relocation: **47/72**. Color-swap ∘ relocation: **0/72**.
- ConceptARC: FilledNotFilled 9/10, Order 2/10. Pair accuracy 77.9% vs strict-task 59.4% — lots of “got one of the three tests.”
- Mechanic-stratified generated set: flood-fill 68.6%, gravity-and-stacking **2.9%**.

So: latent iteration is not a universal solvent. It refines an operator the memory bound. If the operator was never written, waiting is free and useless.

That is why the explainer’s live toy is three tasks, not one slider to 85%. Settle implements a local fall rule you can see finish as R grows — and the caption says the real model is weak at generated gravity. Bind writes a Hebbian map and is done at R = 1, matching the 96/96 color result in spirit. Compose applies only the color map and **never relocates**, so R = 4 is as wrong as R = 0, matching Table 4. The toy is not BDH-CQ. It is the linear-attention special case plus a local rule, running in the browser, labeled as such. Pathway’s brief allows that. It does not allow a scripted 85%.

## The tax

Observability. A CoT transcript is a mediocre window on the true computation, but it is a window. H_R is a high-dimensional object. Alignment, debugging, and contestation get harder, not easier, as you internalize reasoning. Fixed-size S also means interference rather than eviction: the memory problem changes shape.

Maturity: early pretraining from 1B to 600B is an architectural scaling note, not a second ARC number. Partnerships (SageMaker HyperPod, AWS) are deployment facts. Neither is an independent reproduction of the 150M recipe.

## What to do with the explainer

Move R on Settle until the grid matches truth. Move R on Compose until you are bored. Then look at Table 5 and say, out loud: twenty-one, twenty-seven, twenty-nine point five, seven hundredths of a cent, zero tokens. If HIGH had not beaten LOW on the same split, or if the HIGH point were not cheaper than every plotted system of equal-or-higher accuracy on that August plane, the claim would be false.

That is the whole artifact.

## References

1. Engdahl, Kosowski, Chorowski, Stamirowska, Uznański, Jiang, Phadke, Kinas, Zhong. *BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.* arXiv:2608.09888, 2026.
2. Kosowski, Uznański, Chorowski, Stamirowska, Bartoszkiewicz. *The Dragon Hatchling.* arXiv:2509.26507, 2025.
3. Geiping et al. *Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach.* arXiv:2502.05171, 2025.
4. Hao et al. *Training Large Language Models to Reason in a Continuous Latent Space.* arXiv:2412.06769, 2024.
5. Snell et al. *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* arXiv:2408.03314, 2024.
6. Wei et al. *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.* NeurIPS 2022. arXiv:2201.11903.
7. Wang et al. *Hierarchical Reasoning Model.* arXiv:2506.21734, 2025.
8. Jolicoeur-Martineau. *Less is More: Recursive Reasoning with Tiny Networks.* arXiv:2510.04871, 2025.
9. Chollet. *On the Measure of Intelligence.* arXiv:1911.01547, 2019.
