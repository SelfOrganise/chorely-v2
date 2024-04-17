export function scoreToTimes(score: number): number {
  return score < 0 ? Math.abs(score) : score + 1;
}

export const Positive = 1;
export const Negative = -1;
