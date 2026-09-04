/** Official ARC-AGI cell colors (Chollet). Index 0 is the empty/black cell. */
export const ARC_HEX = [
  "#000000",
  "#0074D9",
  "#FF4136",
  "#2ECC40",
  "#FFDC00",
  "#AAAAAA",
  "#F012BE",
  "#FF851B",
  "#7FDBFF",
  "#870C25",
] as const;

export function arcFill(value: number): string {
  if (value < 0 || value >= ARC_HEX.length) return "#1a1a1a";
  return ARC_HEX[value];
}
