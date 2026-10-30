type SearchParamScalar = string | number | boolean;
type SearchParamValue = SearchParamScalar | readonly (SearchParamScalar | null | undefined)[] | null | undefined;

/** Build an encoded query string, omitting only nullish values. Arrays become repeated keys. */
export function createSearchParams(parameters: Record<string, SearchParamValue>) {
  const entries = Object.entries(parameters).flatMap(([key, value]) => {
    if (value === undefined || value === null) return [];

    const values = Array.isArray(value) ? value : [value];
    return values.flatMap((value) =>
      value === undefined || value === null ? [] : [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`],
    );
  });

  return entries.length ? `?${entries.join('&')}` : '';
}
