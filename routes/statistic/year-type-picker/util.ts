import type { YearsAndTypes } from './types';

export function scrollYearsByWheel(event: {
  currentTarget: { clientWidth: number; scrollLeft: number; scrollWidth: number };
  deltaY: number;
}) {
  const { currentTarget, deltaY } = event;

  if (currentTarget.scrollWidth > currentTarget.clientWidth && deltaY) {
    currentTarget.scrollLeft += deltaY;
  }
}

export function getTypesByYear({
  yearsAndTypes,
  selectedYear,
}: {
  yearsAndTypes: { year: string; types: string[] }[];
  selectedYear: number;
}) {
  return yearsAndTypes?.find(({ year }: YearsAndTypes) => +year === selectedYear)?.types;
}
