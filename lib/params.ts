/** Helpers for reading Next.js searchParams, which may repeat a key. */

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function param(params: RawSearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0]?.trim() ?? '';
  return value?.trim() ?? '';
}

export function intParam(params: RawSearchParams, key: string, fallback = 1): number {
  const parsed = Number.parseInt(param(params, key), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function oneOf<T extends string>(
  params: RawSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  const value = param(params, key);
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
