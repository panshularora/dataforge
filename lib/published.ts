/**
 * Single source of truth for every published number shown in the explainer.
 * Do not interpolate, invent, or mix benchmarks. If a figure is derived, say so.
 *
 * Primary source: Engdahl et al., "BDH-CQ: In-Context Learning with Recurrent
 * Latent Reasoning", arXiv:2608.09888, 10 Aug 2026.
 */

export const PAPER = {
  bdh: {
    title: "The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain",
    authors: "Kosowski, Uznański, Chorowski, Stamirowska, Bartoszkiewicz",
    year: 2025,
    arxiv: "2509.26507",
    href: "https://arxiv.org/abs/2509.26507",
  },
  bdhCq: {
    title: "BDH-CQ: In-Context Learning with Recurrent Latent Reasoning",
    authors: "Engdahl, Kosowski, Chorowski, Stamirowska, Uznański, Jiang, Phadke, Kinas, Zhong",
    year: 2026,
    arxiv: "2608.09888",
    href: "https://arxiv.org/abs/2608.09888",
    date: "10 Aug 2026",
  },
  snell: {
    title: "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters",
    authors: "Snell et al.",
    year: 2024,
    arxiv: "2408.03314",
    href: "https://arxiv.org/abs/2408.03314",
  },
  geiping: {
    title: "Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach",
    authors: "Geiping et al.",
    year: 2025,
    arxiv: "2502.05171",
    href: "https://arxiv.org/abs/2502.05171",
  },
  coconut: {
    title: "Training Large Language Models to Reason in a Continuous Latent Space",
    authors: "Hao et al.",
    year: 2024,
    arxiv: "2412.06769",
    href: "https://arxiv.org/abs/2412.06769",
  },
  wei: {
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    authors: "Wei et al.",
    year: 2022,
    arxiv: "2201.11903",
    href: "https://arxiv.org/abs/2201.11903",
  },
  chollet: {
    title: "On the Measure of Intelligence",
    authors: "Chollet",
    year: 2019,
    arxiv: "1911.01547",
    href: "https://arxiv.org/abs/1911.01547",
  },
  hrm: {
    title: "Hierarchical Reasoning Model",
    authors: "Wang et al.",
    year: 2025,
    arxiv: "2506.21734",
    href: "https://arxiv.org/abs/2506.21734",
  },
  trm: {
    title: "Less is More: Recursive Reasoning with Tiny Networks",
    authors: "Jolicoeur-Martineau",
    year: 2025,
    arxiv: "2510.04871",
    href: "https://arxiv.org/abs/2510.04871",
  },
} as const;

/** Headline operating point. Paper §5, also the abstract. */
export const HEADLINE = {
  model: "BDH-CQ",
  params: "150M",
  split: "ARC-AGI-1 public evaluation",
  nTasks: 400,
  nTestPairs: 419,
  passAt1Count: 97,
  passAt1: 0.2425,
  passAt2Count: 118,
  passAt2: 0.295,
  passAt2Wilson: [0.2524, 0.3415] as const,
  costUsd: 0.0007,
  h200Seconds: 0.85,
  h200HourRateUsd: 3,
  tokensVerbalized: 0,
} as const;

/**
 * Table 5 — effort scaling. The paper trains with multiple latent-reasoning
 * levels, then selects the level at inference. Exact internal iteration
 * counts are proprietary (paper §3.3).
 */
export const TABLE5 = {
  high: { effort: "HIGH" as const, passAt2: 0.295, costReductionVsHigh: 0 },
  medium: { effort: "MEDIUM" as const, passAt2: 0.27, costReductionVsHigh: 0.11 },
  low: { effort: "LOW" as const, passAt2: 0.21, costReductionVsHigh: 0.22 },
} as const;

/** Dollar figures implied by Table 5 percentages applied to the $0.00070 HIGH point. */
export function derivedCostUsd(costReductionVsHigh: number): number {
  return HEADLINE.costUsd * (1 - costReductionVsHigh);
}

/**
 * §6.6 — MIN vs STANDARD on the deployed system (a different measurement
 * from Table 5). 111/400 vs 118/400; McNemar p = 0.167, statistically unresolved.
 */
export const SECTION_66 = {
  minSolved: 111,
  standardSolved: 118,
  nTasks: 400,
  minCostUsd: 0.00088399,
  standardCostUsd: 0.00265246,
  mcnemarP: 0.167,
  both: 105,
  standardOnly: 13,
  minOnly: 6,
  neither: 276,
} as const;

export const LUNA = {
  name: "GPT-5.6 Luna (Low)",
  passAt2: 0.342,
  leaderboardCostUsd: 0.04,
  leaderboardDate: "4 Aug 2026",
  cheaperFactorBeforeCut: 57,
  cheaperFactorAfterCut: 11,
} as const;

export const TRANSDUCTIVE_COSTS = {
  hrmUsd: 1.48,
  trmUsd: 1.76,
  note: "ARC Prize reported costs; these pipelines run task-specific optimization (backward pass) on evaluation puzzles before scoring.",
} as const;

export const CONCEPTARC = {
  nTasks: 160,
  nPairs: 480,
  semantic: { taskPass2: 95, taskPass2Rate: 0.5938, pairPass2: 374, pairPass2Rate: 0.7792 },
  opaque: { taskPass2: 96, taskPass2Rate: 0.6, pairPass2: 374, pairPass2Rate: 0.7792 },
  families: [
    { name: "FilledNotFilled", taskP2: 9 },
    { name: "TopBottom2D", taskP2: 9 },
    { name: "ExtendToBoundary", taskP2: 8 },
    { name: "CleanUp", taskP2: 8 },
    { name: "HorizontalVertical", taskP2: 7 },
    { name: "TopBottom3D", taskP2: 7 },
    { name: "ExtractObjects", taskP2: 7 },
    { name: "Center", taskP2: 6 },
    { name: "CompleteShape", taskP2: 6 },
    { name: "Count", taskP2: 6 },
    { name: "AboveBelow", taskP2: 5 },
    { name: "MoveToBoundary", taskP2: 5 },
    { name: "InsideOutside", taskP2: 4 },
    { name: "SameDifferent", taskP2: 4 },
    { name: "Copy", taskP2: 2 },
    { name: "Order", taskP2: 2 },
  ],
} as const;

export const CONTROLLED = {
  colorPermutationHeldOut: { solved: 96, total: 96, note: "dense task-specific color mappings, 2–8 simultaneous bindings" },
  composition: {
    n: 72,
    relocationAlone: 72,
    reflectionAlone: 72,
    rotationAlone: 72,
    rotationPlusRelocation: 72,
    reflectionPlusRelocation: 47,
    colorSwapAlone: 26,
    colorSwapPlusRelocation: 0,
  },
  gravityGenerated: { rate: 0.029, n: 68, note: "mechanic-stratified generated set, Appendix A.2" },
  floodFillGenerated: { rate: 0.686, n: 51, note: "mechanic-stratified generated set, Appendix A.2" },
} as const;

export const CLAIM = {
  sentence:
    "A 150M BDH-CQ system raises ARC-AGI-1 pass@2 from 21% (LOW) to 29.5% (HIGH) by iterating a latent workspace after writing demonstrations into recurrent memory — with zero verbalized chain-of-thought tokens — and the HIGH point sits at $0.0007/task, beyond the previously reported cost–accuracy Pareto frontier.",
  falsifiable:
    "If HIGH effort did not beat LOW on the same 400-task public split, or if the HIGH point were not cheaper than every plotted system of equal-or-higher accuracy on the 4 Aug 2026 ARC Prize plane, the claim would be false.",
} as const;
