import { buildHeatmapColumns, getDateKey, getHeatmapMonthSpans } from './utils';

describe('dashboard heatmap layout', () => {
  it('starts weeks on Monday and keeps every date under its real week', () => {
    const columns = buildHeatmapColumns(2026, 'all', 'activities', {});

    expect(columns[0].map(({ date }) => getDateKey(date))).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
    ]);
    expect(columns[0][3].isOutsideYear).toBe(false);
    expect(columns[0][0].isOutsideYear).toBe(true);
    expect(getDateKey(columns.at(-1)?.[6].date ?? new Date(0))).toBe('2027-01-03');
  });

  it('sizes month labels by the actual number of calendar weeks', () => {
    const columns = buildHeatmapColumns(2026, 'all', 'activities', {});
    const monthSpans = getHeatmapMonthSpans(
      2026,
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      columns,
    );

    expect(monthSpans).toHaveLength(12);
    expect(monthSpans.reduce((sum, { columnSpan }) => sum + columnSpan, 0)).toBe(columns.length);
    expect(monthSpans[5].columnSpan).toBeGreaterThan(0);
    expect(monthSpans[6].columnSpan).toBeGreaterThan(0);
  });
});
