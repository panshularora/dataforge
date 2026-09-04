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
console.log("engine ok");
