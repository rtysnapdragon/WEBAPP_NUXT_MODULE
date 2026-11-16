export const DEFAULT_STORE_TTL = 30_000

export function isStoreFresh(lastFetchedAt, staleMs = DEFAULT_STORE_TTL) {
  return lastFetchedAt > 0 && Date.now() - lastFetchedAt < staleMs
}
