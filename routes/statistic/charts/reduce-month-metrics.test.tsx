import type { ReactElement } from 'react';
import { LANGUAGES } from '@const/enums';
import { reduceMonthMetrics } from './utils';
import type { MonthMetrics } from './types';

describe('reduce month metrics', () => {
  it('returns all twelve chart points and fills missing months with zero', () => {
    const result = reduceMonthMetrics(
      [{ totalDistance: 12.345, totalDuration: 60, totalItems: 2 }] as unknown as MonthMetrics,
      LANGUAGES.english,
    );
    expect(result.distance.items).toHaveLength(12);
    expect(result.distance.items[0].value).toBe(12);
    expect(result.distance.items[1].value).toBe(0);
    expect(result.amount.items[0].value).toBe(2);
    expect(result.duration.title).toBe('Time');
    expect(result.distance.items[0].topLabelComponent()).toBeTruthy();
    expect(result.distance.items[1].topLabelComponent()).toBeTruthy();
  });

  it('keeps a multi-digit monthly value on one line', () => {
    const result = reduceMonthMetrics(
      [{ totalDistance: 1234, totalDuration: 60, totalItems: 2 }] as unknown as MonthMetrics,
      LANGUAGES.english,
    );

    const label = result.distance.items[0].topLabelComponent() as ReactElement<{
      children: number;
      numberOfLines: number;
      style: object;
    }>;

    expect(label.props.children).toBe(1234);
    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.style).toEqual(expect.objectContaining({ textAlign: 'center', width: '100%' }));
  });
});
