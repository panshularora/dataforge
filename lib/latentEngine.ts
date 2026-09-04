/**
 * Pedagogical latent-iteration substrate.
 *
 * This is NOT BDH-CQ. Internal dimensions and update rules of BDH-CQ are
 * proprietary (Engdahl et al. 2026, §3.3). The toy implements the linear-
 * attention special case the paper itself names — S_t = S_{t-1} + U(D_t) —
 * plus a local iterative settle rule, so a learner can change R and watch
 * a hidden state move.
 */

export type Grid = number[][];

export type ToyKind = "settle" | "bind" | "compose";

export interface Demo {
  input: Grid;
  output: Grid;
}

export interface ToyTask {
  id: ToyKind;
  name: string;
  whatItTests: string;
  paperNote: string;
  demos: Demo[];
  query: Grid;
  truth: Grid;
  /** Iterations the filmstrip can scrub. */
  maxR: number;
  /** R at which this toy first matches truth, or -1 if it never does. */
  solvesAt: number;
}

export interface StepSnapshot {
  r: number;
  decoded: Grid;
  energy: number;
  correct: boolean;
  cellChanged: boolean[][];
  /** Fast-weight color map after ingesting the active demos. Null on Settle. */
  S: number[][] | null;
}

export function cloneGrid(g: Grid): Grid {
  return g.map((row) => row.slice());
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) if (a[i][j] !== b[i][j]) return false;
  }
  return true;
}

export function hamming(a: Grid, b: Grid): number {
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[i].length; j++) if (a[i][j] !== b[i][j]) n++;
  }
  return n;
}

function changedMask(prev: Grid, next: Grid): boolean[][] {
  return next.map((row, i) => row.map((v, j) => v !== prev[i][j]));
}

/** Count masses that still have an empty cell beneath them in the same column. */
export function unsupportedMass(g: Grid): number {
  const h = g.length;
  const w = g[0].length;
  let n = 0;
  for (let c = 0; c < w; c++) {
    for (let r = 0; r < h - 1; r++) {
      if (g[r][c] !== 0 && g[r + 1][c] === 0) n++;
    }
  }
  return n;
}

/** One synchronous fall step: each unsupported mass drops at most one row. */
export function fallOnce(g: Grid): Grid {
  const h = g.length;
  const w = g[0].length;
  const next = cloneGrid(g);
  for (let c = 0; c < w; c++) {
    for (let r = h - 2; r >= 0; r--) {
      if (next[r][c] !== 0 && next[r + 1][c] === 0) {
        next[r + 1][c] = next[r][c];
        next[r][c] = 0;
      }
    }
  }
  return next;
}

const N_COLORS = 10;

/** Hebbian color map S[out][in] accumulated from demonstration cells. */
export function bindColorMap(demos: Demo[]): number[][] {
  const S = Array.from({ length: N_COLORS }, () => Array(N_COLORS).fill(0));
  for (const d of demos) {
    for (let i = 0; i < d.input.length; i++) {
      for (let j = 0; j < d.input[i].length; j++) {
        const a = d.input[i][j];
        const b = d.output[i]?.[j];
        if (b === undefined) continue;
        S[b][a] += 1;
      }
    }
  }
  return S;
}

export function applyColorMap(g: Grid, S: number[][]): Grid {
  return g.map((row) =>
    row.map((col) => {
      let best = col;
      let score = -1;
      for (let out = 0; out < N_COLORS; out++) {
        if (S[out][col] > score) {
          score = S[out][col];
          best = out;
        }
      }
      return score > 0 ? best : col;
    }),
  );
}

export const TASKS: ToyTask[] = [
  {
    id: "settle",
    name: "Settle",
    whatItTests: "A local operator that needs repeated application. Each latent step drops every unsupported cell one row. Truth is reached only after enough steps for the highest cell to land.",
    paperNote:
      "Toy local rule — not BDH-CQ. Generated gravity-and-stacking tasks are a known weak mechanic for the real system (2.9% solve rate, Appendix A.2). Iteration completes an operator that is already in the update; it does not induce one the model failed to bind.",
    demos: [
      {
        input: [
          [2, 0, 1],
          [0, 1, 0],
          [0, 0, 1],
        ],
        output: [
          [0, 0, 0],
          [0, 0, 1],
          [2, 1, 1],
        ],
      },
      {
        input: [
          [0, 3, 0],
          [3, 0, 0],
          [0, 1, 3],
        ],
        output: [
          [0, 0, 0],
          [0, 3, 0],
          [3, 1, 3],
        ],
      },
    ],
    query: [
      [2, 0, 1, 0],
      [0, 1, 0, 2],
      [0, 0, 1, 0],
      [1, 0, 0, 1],
    ],
    truth: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 1, 2],
      [1, 1, 1, 1],
    ],
    maxR: 4,
    solvesAt: 2,
  },
  {
    id: "bind",
    name: "Bind",
    whatItTests: "Demonstration-conditioned color mapping written into a fast-weight matrix S. One read is enough when the map is consistent — extra iterations do not change the answer.",
    paperNote:
      "Linear-attention special case S_t = S_{t-1} + U(D_t), named in §3.2. Real BDH-CQ solves 96/96 held-out dense color mappings (2–8 simultaneous bindings, §6.3). Toy, not the proprietary F_θ.",
    demos: [
      {
        input: [
          [1, 3, 1],
          [3, 1, 3],
          [1, 3, 1],
        ],
        output: [
          [2, 4, 2],
          [4, 2, 4],
          [2, 4, 2],
        ],
      },
      {
        input: [
          [3, 3, 1],
          [1, 1, 3],
          [3, 1, 1],
        ],
        output: [
          [4, 4, 2],
          [2, 2, 4],
          [4, 2, 2],
        ],
      },
    ],
    query: [
      [1, 1, 3],
      [3, 1, 1],
      [1, 3, 3],
    ],
    truth: [
      [2, 2, 4],
      [4, 2, 2],
      [2, 4, 4],
    ],
    maxR: 4,
    solvesAt: 1,
  },
  {
    id: "compose",
    name: "Compose",
    whatItTests: "Demos show a color swap AND a relocation. The toy only writes a color map — it never moves the motif. Extra latent steps cannot invent the missing operator.",
    paperNote:
      "Mirrors Table 4: color-swap composed with relocation is 0/72 for BDH-CQ. Rotation∘relocation is 72/72; composition is operation-dependent, not a generic ‘more R’ story.",
    demos: [
      {
        input: [
          [1, 3, 0, 0],
          [3, 1, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        output: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 2, 4],
          [0, 0, 4, 2],
        ],
      },
      {
        input: [
          [3, 1, 0, 0],
          [1, 3, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        output: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 4, 2],
          [0, 0, 2, 4],
        ],
      },
    ],
    query: [
      [1, 1, 0, 0],
      [3, 3, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    truth: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 2, 2],
      [0, 0, 4, 4],
    ],
    maxR: 4,
    solvesAt: -1,
  },
];

export function getTask(id: ToyKind): ToyTask {
  const t = TASKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown task ${id}`);
  return t;
}

/**
 * Run the toy for r = 0..maxR inclusive.
 * r = 0 is the query (no latent step). Each increment is one actual update.
 * demoMask[i] === false drops demonstration i from the Hebbian write.
 */
export function runToy(task: ToyTask, demoMask?: boolean[]): StepSnapshot[] {
  const snaps: StepSnapshot[] = [];
  let state = cloneGrid(task.query);
  const demos = task.demos.filter((_, i) => demoMask?.[i] !== false);
  const S = task.id === "settle" ? null : bindColorMap(demos);

  for (let r = 0; r <= task.maxR; r++) {
    const decoded = cloneGrid(state);
    const energy =
      task.id === "settle" ? unsupportedMass(decoded) : hamming(decoded, task.truth);
    const prev = snaps.length ? snaps[snaps.length - 1].decoded : task.query;
    snaps.push({
      r,
      decoded,
      energy,
      correct: gridsEqual(decoded, task.truth),
      cellChanged: r === 0 ? decoded.map((row) => row.map(() => false)) : changedMask(prev, decoded),
      S,
    });
    if (r === task.maxR) break;
    if (task.id === "settle") {
      state = fallOnce(state);
    } else {
      // Bind and compose share the color-map read. Compose never relocates,
      // so it stays wrong. Re-applying S is idempotent — extra R is a no-op
      // once the map has been read, which is the lesson.
      state = applyColorMap(task.query, S!);
    }
  }
  return snaps;
}
