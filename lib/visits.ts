export const GOATCOUNTER_SITE_URL = 'https://portfolio-qbael.goatcounter.com';

export async function fetchVisitCount(fetcher: typeof fetch = fetch) {
  const response = await fetcher(`${GOATCOUNTER_SITE_URL}/counter/TOTAL.json`, {
    cache: 'no-store',
    signal: globalThis.AbortSignal?.timeout?.(8_000),
  });
  if (!response.ok) throw new Error('Counter unavailable');
  return parseVisitCount(await response.json());
}

export function parseVisitCount(value: unknown): number {
  const count = (value as { count?: unknown } | null)?.count;
  if (
    typeof count !== 'string' ||
    !/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)$/.test(count)
  ) {
    throw new Error('Invalid visit count');
  }

  const total = Number(count.replaceAll(',', ''));
  if (!Number.isSafeInteger(total)) throw new Error('Unsafe visit count');
  return total;
}
