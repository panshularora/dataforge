# Disclosure: AI assistance, code, data, assets, licenses

## AI assistance

Grok (xAI, Grok Build / Grok 4.6) was used to:

- Scaffold and rewrite the Next.js explainer, TypeScript toy engine, and SVG charts
- Draft README, concept summary, blog, and this file
- Restyle the interface away from a generic indigo dashboard

The team chose the concept (inference-time scaling + cost–accuracy Pareto), checked every number against arXiv:2608.09888 and arXiv:2509.26507, and must be able to defend every equation, label, and citation in live Q&A.

AI did **not** invent the 21 / 27 / 29.5 split, the $0.0007 headline, or the 0/72 composition result. An earlier draft that showed 53% → 85% and mixed Snell MATH points onto an ARC chart was discarded after checking the primary paper.

## Code

| Component | Origin | License |
|---|---|---|
| Next.js, React, Tailwind CSS | upstream | MIT |
| GSAP + @gsap/react | GreenSock | GSAP standard license (this project uses the standard/free terms for the core library) |
| `app/`, `lib/` | original for this submission | MIT |
| Official ARC cell colors | ARC-AGI / Chollet | used as a factual palette |

No fork of Pathway’s BDH repository. The toy is an independent pedagogical implementation of the linear-attention special case named in §3.2 plus a local fall rule.

## Data

| Item | Source | Notes |
|---|---|---|
| Table 5 effort | arXiv:2608.09888 | LOW 21%, MEDIUM 27%, HIGH 29.5% |
| Headline cost | §5 | $0.00070, 0.85 H200-s, $3/H200-h |
| Luna point | §5 / ARC Prize 4 Aug 2026 | 34.2%, $0.040 listed |
| ConceptARC, Table 4, Appendix A.2 | same paper | copied, not re-run |
| Toy grids | original | labeled toy; not official ARC tasks |

MEDIUM/LOW dollar values are **derived** from Table 5 reduction percentages applied to $0.00070. They are labeled as derived.

## Assets

- Fonts: Syne, Atkinson Hyperlegible, IBM Plex Mono (Google Fonts, OFL)
- No stock photography
- No BDH or BDH-CQ checkpoints

## License

Project source and original prose: MIT. See `LICENSE`.
