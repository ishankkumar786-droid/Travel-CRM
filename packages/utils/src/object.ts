/**
 * Object utility functions.
 */

/** Remove undefined and null values from an object (shallow) */
export function omitNullish<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]: NonNullable<T[K]> } {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined),
  ) as { [K in keyof T]: NonNullable<T[K]> };
}

/** Pick specific keys from an object */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>,
  );
}

/** Omit specific keys from an object */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const keySet = new Set(keys as string[]);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keySet.has(k))) as Omit<T, K>;
}

/** Deep clone an object using JSON (suitable for plain objects) */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
