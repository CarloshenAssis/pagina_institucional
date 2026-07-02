export function isRateLimited(
  submissionTimestamps: number[],
  maxPerWindow: number,
  windowMs: number
): boolean {
  const cutoff = Date.now() - windowMs;
  const recent = submissionTimestamps.filter((t) => t > cutoff);
  return recent.length >= maxPerWindow;
}
