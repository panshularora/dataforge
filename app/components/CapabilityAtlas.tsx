"use client";

import { useState } from "react";
import Evidence from "./Evidence";
import { CONCEPTARC, CONTROLLED } from "@/lib/published";

const MAX = 10;

export default function CapabilityAtlas() {
  const [focus, setFocus] = useState<string | null>("Order");

  return (
    <div className="atlas">
      <p className="lead">
        Extra latent compute is not a universal solvent. The paper’s own atlas
        shows where demonstration-conditioned schemas bind — and where they
        snap.
      </p>

      <div className="atlas-grid">
        {CONCEPTARC.families.map((f) => {
          const on = focus === f.name;
          return (
            <button
              key={f.name}
              type="button"
              className={`atlas-row${on ? " is-on" : ""}`}
              onClick={() => setFocus(f.name)}
            >
              <span className="atlas-name">{f.name}</span>
              <span className="atlas-bar" aria-hidden>
                <span style={{ width: `${(f.taskP2 / MAX) * 100}%` }} />
              </span>
              <span className="atlas-n">{f.taskP2}/10</span>
            </button>
          );
        })}
      </div>

      <p className="paper-note">
        <Evidence>Paper · Table 2</Evidence> ConceptARC strict task pass@2,
        semantic IDs, 10 tasks per family. Copy and Order are 2/10; FilledNotFilled
        and TopBottom2D are 9/10. Pair accuracy is higher than task accuracy
        (77.9% vs 59.4%) — many tasks are solved on one or two of three tests,
        which is not consistent rule induction.
      </p>

      <div className="fail-grid">
        <article>
          <h3>Binds</h3>
          <p>
            Dense color permutations:{" "}
            <strong>
              {CONTROLLED.colorPermutationHeldOut.solved}/
              {CONTROLLED.colorPermutationHeldOut.total}
            </strong>{" "}
            held-out outputs at rank one, two to eight simultaneous bindings.
          </p>
          <Evidence>Paper · §6.3</Evidence>
        </article>
        <article>
          <h3>Composes — sometimes</h3>
          <p>
            Rotation ∘ relocation {CONTROLLED.composition.rotationPlusRelocation}/72.
            Reflection ∘ relocation {CONTROLLED.composition.reflectionPlusRelocation}/72.
            Color-swap ∘ relocation{" "}
            <strong>{CONTROLLED.composition.colorSwapPlusRelocation}/72</strong>.
          </p>
          <Evidence>Paper · Table 4</Evidence>
        </article>
        <article>
          <h3>Breaks</h3>
          <p>
            Generated gravity-and-stacking {CONTROLLED.gravityGenerated.rate * 100}%
            vs flood-fill {(CONTROLLED.floodFillGenerated.rate * 100).toFixed(1)}%
            on the mechanic-stratified set. The toy above can settle gravity with a
            local rule; the trained system often cannot.
          </p>
          <Evidence>Paper · Appendix A.2</Evidence>
        </article>
      </div>
    </div>
  );
}
