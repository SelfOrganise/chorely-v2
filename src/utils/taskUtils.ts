export function scoreToTimes(score: number): number {
  return score < 0 ? Math.abs(score) : score + 1;
}
