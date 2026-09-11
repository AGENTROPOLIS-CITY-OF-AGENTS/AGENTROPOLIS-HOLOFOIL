export const BANNED_IP_PATTERNS: RegExp[] = [
  /doginal/i,
  /dogecoin/i,
  /drc-20/i,
  /drc20/i,
  /kabosu/i,
  /shiba/i,
  /\bdoge\b/i,
  /doginal dogs/i,
  /🐕/,
];

export function findBannedIp(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of BANNED_IP_PATTERNS) {
    const match = text.match(pattern);
    if (match) hits.push(match[0]);
  }
  return hits;
}

export function assertIpClean(text: string, label = "content"): void {
  const hits = findBannedIp(text);
  if (hits.length > 0) {
    throw new Error(`Removed-IP guard failed in ${label}: ${hits.join(", ")}`);
  }
}
