"""Build concept-summary and blog PDFs. Editorial, one-column, no decoration."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
INK = colors.HexColor("#141c18")
KILN = colors.HexColor("#c45c26")
TEAL = colors.HexColor("#215e59")
SOFT = colors.HexColor("#3a4740")
RULE = colors.HexColor("#8b9688")
PAPER = colors.HexColor("#f3f1ea")


def styles():
    base = getSampleStyleSheet()
    s = {
        "kicker": ParagraphStyle(
            "kicker",
            parent=base["Normal"],
            fontName="Times-Bold",
            fontSize=8,
            textColor=KILN,
            leading=10,
        ),
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="Times-Bold",
            fontSize=16,
            leading=19,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=6,
        ),
        "h": ParagraphStyle(
            "h",
            parent=base["Heading2"],
            fontName="Times-Bold",
            fontSize=11,
            leading=14,
            textColor=TEAL,
            spaceBefore=8,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=9.3,
            leading=12.4,
            textColor=INK,
            alignment=TA_JUSTIFY,
            spaceAfter=5,
        ),
        "code": ParagraphStyle(
            "code",
            parent=base["Code"],
            fontName="Courier",
            fontSize=8.5,
            leading=12,
            textColor=INK,
            backColor=colors.HexColor("#e8e4d8"),
            leftIndent=6,
            rightIndent=6,
            spaceBefore=4,
            spaceAfter=8,
        ),
        "foot": ParagraphStyle(
            "foot",
            parent=base["Normal"],
            fontName="Times-Italic",
            fontSize=8,
            textColor=SOFT,
            leading=11,
        ),
        "li": ParagraphStyle(
            "li",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=9.5,
            leading=13,
            textColor=INK,
            leftIndent=4,
        ),
    }
    return s


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(INK)
    canvas.setLineWidth(0.6)
    canvas.line(18 * mm, A4[1] - 12 * mm, A4[0] - 18 * mm, A4[1] - 12 * mm)
    canvas.setFont("Times-Roman", 8)
    canvas.setFillColor(SOFT)
    canvas.drawString(18 * mm, A4[1] - 10 * mm, "DataForge 2026  ·  Pathway track  ·  BDH-CQ")
    canvas.drawRightString(A4[0] - 18 * mm, A4[1] - 10 * mm, "Inference-time scaling")
    canvas.line(18 * mm, 14 * mm, A4[0] - 18 * mm, 14 * mm)
    canvas.drawString(18 * mm, 10 * mm, "Primary source: arXiv:2608.09888")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


def P(text: str, style):
    return Paragraph(text, style)


def build_summary(s):
    story = [
        P("ONE-PAGE CONCEPT SUMMARY", s["kicker"]),
        P("Inference-time scaling without a verbal scratchpad", s["title"]),
        P(
            "Chain-of-thought allocates extra inference compute by decoding tokens and feeding them back. "
            "That works, and it is expensive: every intermediate state must pass through a vocabulary, an "
            "autoregressive step, and a growing context. <b>Inference-time scaling via latent computation</b> "
            "spends the same budget inside a recurrent hidden state and emits only the answer. The current "
            "reason it matters is that 2024–2026 reasoning systems (o1-class token budgets, Coconut-style "
            "continuous thoughts, recurrent-depth LMs, HRM/TRM) all buy accuracy with extra test-time work, "
            "but they do not buy it the same way.",
            s["body"],
        ),
        P("Mechanism", s["h"]),
        P(
            "BDH-CQ (Engdahl et al., 2026) is a 150M-parameter reasoner in the Dragon Hatchling (BDH) family. "
            "Demonstrations of an unseen task update a recurrent associative memory "
            "<font face='Courier'>S_t = U_theta(S_{t-1}, D_t)</font> "
            "with theta frozen. After K examples, a latent workspace is encoded and iterated "
            "<font face='Courier'>H_{r+1} = F_theta(H_r, S_K)</font>, "
            "then decoded. No evaluation-task backward pass, no puzzle identity embedding, no verbal trace. "
            "Linear attention is the special case "
            "<font face='Courier'>S_t = S_{t-1} + U_theta(D_t)</font>. "
            "Dimensions of U_theta and F_theta are proprietary; this is a published interface, "
            "not a full recipe. BDH itself is not an SSM in the Mamba sense: BDH-GPU is ReLU-low-rank "
            "communication plus linear attention, with Hebbian synaptic working memory, ~5% sparse "
            "non-negative activations, and reported monosemantic synapses (Kosowski et al., 2025).",
            s["body"],
        ),
        P("What changes", s["h"]),
        P(
            "Extra compute is a deeper unrolling of H, not a longer string. Memory stays fixed-size; cost "
            "and latency do not inherit decode-length. The trade: the trace is unobservable, superposition "
            "can interfere, and composition is not guaranteed just because R increased.",
            s["body"],
        ),
        P("Evidence (labeled)", s["h"]),
        P(
            "On the 400-task public ARC-AGI-1 split, HIGH effort is <b>118/400 = 29.5% pass@2</b> "
            "(Wilson 25.2–34.2%) at a computed <b>$0.00070/task</b> (0.85 H200-s at $3/h). pass@1 is "
            "97/400 = 24.25%. Table 5, on a model trained with multiple latent-reasoning levels, reports "
            "<b>LOW 21%, MEDIUM 27%, HIGH 29.5%</b>, all with zero CoT tokens. A black-box audit "
            "(Kinas / Zhong) reproduced 29.5% without weights. This is developer-reported hardware cost "
            "plus an independent score check — not an independent reimplementation.",
            s["body"],
        ),
        P("Comparators that actually matter", s["h"]),
        P(
            "GPT-5.6 Luna (Low) is <b>more accurate</b> (34.2%) and, on the 4 Aug 2026 ARC Prize listing, "
            "<b>57x costlier</b> at $0.040; after the 30 Jul 80% API cut the paper still reports ~11x. "
            "HRM and TRM report strong ARC numbers via transductive optimization of the evaluation puzzle "
            "(identity embeddings, augmentation, a backward pass) at $1.48 and $1.76 per task. BDH-CQ’s "
            "claim is the in-context, no-backward-pass cost frontier — not a higher raw score than Luna, "
            "and not the same protocol as HRM/TRM. Snell et al. (2024) is the right citation for "
            "token-budget scaling laws; those MATH/GSM8K curves must not be drawn on the ARC plane.",
            s["body"],
        ),
        P("Where it is weaker", s["h"]),
        P(
            "ConceptARC strict-task pass@2 is 59.4% while pair accuracy is 77.9%: many tasks are only "
            "partly solved. Copy and Order are 2/10; FilledNotFilled and TopBottom2D are 9/10. Dense "
            "color maps bind 96/96; color-swap composed with relocation is <b>0/72</b>. Generated "
            "gravity-and-stacking is 2.9% against flood-fill 68.6%. §6.6 MIN vs STANDARD on the deployed "
            "system is 111 vs 118 / 400 (p = 0.167): the large Table 5 jump is a train-and-select "
            "protocol, not a proven one-checkpoint slider.",
            s["body"],
        ),
        P("Maturity and the limitation to keep", s["h"]),
        P(
            "Early BDH pretraining is reported from 1B to 600B with Transformer-like scaling; that is not "
            "the 150M ARC system. AWS/SageMaker integration is a deployment partnership, not an independent "
            "scientific evaluation. Latent effort only refines an operator the memory already bound. More R "
            "will not invent a missing composition. Observability is the other tax: when HIGH fails, there "
            "is no chain of thought to read.",
            s["body"],
        ),
        P(
            "Continue: arXiv:2608.09888 (BDH-CQ); arXiv:2509.26507 (BDH); Geiping et al. 2025 (recurrent "
            "depth); Hao et al. 2024 (Coconut); Snell et al. 2024.",
            s["foot"],
        ),
    ]
    return story


def build_blog(s):
    story = [
        P("TECHNICAL BLOG", s["kicker"]),
        P("The 21 percent that actually matters", s["title"]),
        P(
            "For a year the public story of test-time compute has been a story about words. o1-class "
            "systems spend more decode steps; the answer gets better; the bill grows with the transcript. "
            "Snell et al. (2024) made that trade-off quantitative on MATH and GSM8K. BDH-CQ asks a "
            "narrower question: <b>what if the extra work never becomes text?</b>",
            s["body"],
        ),
        P("Two knobs, not one", s["h"]),
        P(
            "Chain-of-thought is a computational workspace that happens to be a language. Coconut "
            "(Hao et al., 2024) showed that a Transformer can recycle its last hidden state instead of a "
            "token; Geiping et al. (2025) showed that looping a shared block is another way to buy "
            "test-time FLOPs without a longer string. HRM and TRM push a different button on ARC: they "
            "optimize on the evaluation puzzle — augmentations, identity embeddings, a backward pass — "
            "and then vote. BDH-CQ sits in the remaining cell: demonstrations write a recurrent state; "
            "the query is solved by iterating a latent workspace; parameters do not move; no CoT is emitted.",
            s["body"],
        ),
        Preformatted(
            "S_t     = U_theta(S_{t-1}, D_t)\n"
            "H_0     = E_theta(x*, S_K)\n"
            "H_{r+1} = F_theta(H_r, S_K)\n"
            "y       = G_theta(H_R)",
            s["code"],
        ),
        P(
            "Linear attention is the special case S_t = S_{t-1} + U_theta(D_t). Sizes of those maps are "
            "withheld. BDH underneath is a separate claim: Hebbian synaptic working memory, sparse "
            "non-negative activations, ReLU-low-rank plus linear attention. It is not Mamba.",
            s["body"],
        ),
        P("The number that survived contact with the paper", s["h"]),
        P(
            "A 150M configuration scores <b>29.5% pass@2</b> on the 400-task public ARC-AGI-1 split at "
            "<b>$0.00070 per task</b>. pass@1 is 24.25%. An independent black-box audit reproduced 29.5 "
            "without weights. Table 5: LOW 21%, MEDIUM 27%, HIGH 29.5%, zero CoT tokens in every row. "
            "The paper does not say HIGH means 16 recurrent steps.",
            s["body"],
        ),
    ]
    data = [
        [
            P("<b>Effort</b>", s["li"]),
            P("<b>pass@2</b>", s["li"]),
            P("<b>Cost vs HIGH</b>", s["li"]),
        ],
        [P("LOW", s["li"]), P("21%", s["li"]), P("−22%", s["li"])],
        [P("MEDIUM", s["li"]), P("27%", s["li"]), P("−11%", s["li"])],
        [P("HIGH", s["li"]), P("29.5%", s["li"]), P("0", s["li"])],
    ]
    tbl = Table(data, colWidths=[45 * mm, 45 * mm, 55 * mm])
    tbl.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.3, RULE),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8e4d8")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story += [
        tbl,
        Spacer(1, 8),
        P(
            "Two caveats. (1) Table 5 trains at multiple effort levels, then selects at inference. "
            "§6.6 MIN vs STANDARD on the deployed system is 111 vs 118 / 400, p = 0.167 — unresolved. "
            "(2) Luna is more accurate: 34.2% at $0.040 listed. BDH-CQ’s Pareto claim is cost at a given "
            "accuracy (57x cheaper at listed price; ~11x after the July cut), not a new accuracy record. "
            "HRM ($1.48) and TRM ($1.76) optimize the test puzzle and are off this plane. Snell’s MATH "
            "curves do not belong on an ARC chart.",
            s["body"],
        ),
        P("What extra R can and cannot do", s["h"]),
        P(
            "Dense color permutations: 96/96. Rotation composed with relocation: 72/72. Reflection composed with relocation: "
            "47/72. Color-swap composed with relocation: <b>0/72</b>. ConceptARC: FilledNotFilled 9/10, Order 2/10. "
            "Pair accuracy 77.9% vs strict-task 59.4%. Generated flood-fill 68.6%; gravity-and-stacking "
            "<b>2.9%</b>. Latent iteration refines an operator the memory bound. If the operator was "
            "never written, waiting is free and useless.",
            s["body"],
        ),
        P(
            "The explainer’s live toy is three tasks. Settle: a local fall rule finishes as R grows "
            "(caption: the real model is weak at generated gravity). Bind: Hebbian map, done at R = 1. "
            "Compose: color map only, never relocates, so R = 4 is as wrong as R = 0. The toy is the "
            "linear-attention special case plus a local rule, running in the browser, labeled. It is not "
            "BDH-CQ weights.",
            s["body"],
        ),
        P("The tax", s["h"]),
        P(
            "Observability. A CoT transcript is a mediocre window, but it is a window. H_R is not. "
            "Fixed-size S means interference rather than eviction. Early pretraining 1B–600B is an "
            "architectural scaling note, not a second ARC number. SageMaker/AWS is a partnership, not "
            "an independent reproduction of the 150M recipe.",
            s["body"],
        ),
        P("What to do with the explainer", s["h"]),
        P(
            "Move R on Settle until the grid matches truth. Move R on Compose until you are bored. Then "
            "look at Table 5 and say: twenty-one, twenty-seven, twenty-nine point five, seven hundredths "
            "of a cent, zero tokens. If HIGH had not beaten LOW on the same split, or if the HIGH point "
            "were not cheaper than every plotted system of equal-or-higher accuracy on that August plane, "
            "the claim would be false.",
            s["body"],
        ),
        P("References", s["h"]),
        ListFlowable(
            [
                ListItem(P("Engdahl et al. BDH-CQ. arXiv:2608.09888, 2026.", s["li"])),
                ListItem(P("Kosowski et al. The Dragon Hatchling. arXiv:2509.26507, 2025.", s["li"])),
                ListItem(P("Geiping et al. Recurrent depth latent reasoning. arXiv:2502.05171, 2025.", s["li"])),
                ListItem(P("Hao et al. Coconut. arXiv:2412.06769, 2024.", s["li"])),
                ListItem(P("Snell et al. Test-time compute scaling. arXiv:2408.03314, 2024.", s["li"])),
                ListItem(P("Wei et al. Chain-of-thought prompting. arXiv:2201.11903, 2022.", s["li"])),
                ListItem(P("Wang et al. Hierarchical Reasoning Model. arXiv:2506.21734, 2025.", s["li"])),
                ListItem(P("Jolicoeur-Martineau. Tiny recursive networks. arXiv:2510.04871, 2025.", s["li"])),
                ListItem(P("Chollet. On the Measure of Intelligence. arXiv:1911.01547, 2019.", s["li"])),
            ],
            bulletType="1",
            start=1,
            leftIndent=12,
        ),
    ]
    return story


def write_pdf(path: Path, story):
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title=path.stem,
        author="DataForge 2026",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


def main():
    s = styles()
    summary_story = build_summary(s)
    blog_story = build_blog(s)
    write_pdf(ROOT / "concept_summary" / "concept_summary.pdf", summary_story)
    write_pdf(ROOT / "public" / "concept_summary.pdf", summary_story)
    write_pdf(ROOT / "blog" / "blog.pdf", blog_story)
    write_pdf(ROOT / "public" / "blog.pdf", blog_story)
    print("wrote concept_summary.pdf to concept_summary/ and public/")
    print("wrote blog.pdf to blog/ and public/")


if __name__ == "__main__":
    main()
