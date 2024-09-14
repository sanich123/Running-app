import { YearsAndTypes } from './types';

export function getTypesByYear({
  yearsAndTypes,
  selectedYear,
}: {
  yearsAndTypes: { year: string; types: string[] }[];
  selectedYear: number;
}) {
  return yearsAndTypes?.find(({ year }: YearsAndTypes) => +year === selectedYear)?.types;
}
