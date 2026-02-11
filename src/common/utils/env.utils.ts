export type EnvValue = string | undefined | null;

/**
 * Splits a comma-separated string into an array of trimmed strings.
 * Returns an empty array if value is null/undefined.
 */
export const parseCommaList = (value: EnvValue): string[] =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

/**
 * Checks if a list contains wildcards.
 * Returns true if '*' is present.
 */
export const hasWildcard = (values: string[]): boolean => {
  return values.some((value) => value === '*');
};
