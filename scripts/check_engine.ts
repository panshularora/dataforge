import { getTask, runToy } from "../lib/latentEngine";

for (const id of ["settle", "bind", "compose"] as const) {
  const t = getTask(id);
  const s = runToy(t);
  const last = s[s.length - 1];
  console.log(id, {
    solvesAt: t.solvesAt,
    lastCorrect: last.correct,
    r0energy: s[0].energy,
    r1correct: s[1]?.correct,
    r2correct: s[2]?.correct,
    hasS: s[0].S !== null,
  });
  if (id === "settle" && (!s[2].correct || s[1].correct)) {
    throw new Error("settle should first match at R=2");
  }
  if (id === "bind" && !s[1].correct) {
    throw new Error("bind should match at R=1");
  }
  if (id === "compose" && last.correct) {
    throw new Error("compose must never match");
  }
}

const bind = getTask("bind");
const empty = runToy(bind, [false, false]);
if (empty[1].correct) throw new Error("bind with no demos must fail");
if (empty[0].S && empty[0].S[2][1] !== 0) throw new Error("empty S should not bind 1→2");
const one = runToy(bind, [true, false]);
if (!one[1].correct) throw new Error("one consistent demo is enough for bind");
console.log("ablation ok");
console.log("engine ok");
