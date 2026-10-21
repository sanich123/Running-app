import { LANGUAGES } from '@const/enums';
import { buildActivityStatisticSections } from './utils';
import type { ActivityResponse } from '@R/runich-api/types';

function createActivity(overrides: Partial<ActivityResponse> = {}): ActivityResponse {
  return {
    id: 'activity-1',
    userId: 'user-1',
    date: '2026-10-19T07:00:00.000Z',
    sport: 'run',
    duration: 3_600_000,
    distance: 10_000,
    elevationGain: 100,
    profile: {},
    _count: { comments: 0, likes: 0 },
    ...overrides,
  };
}

describe('buildActivityStatisticSections', () => {
  it('shows available workout metrics in grouped sections', () => {
    const sections = buildActivityStatisticSections(
      createActivity({
        steps: 3_600,
        averageHeartRate: 140,
        minHeartRate: 90,
        maxHeartRate: 175,
        caloriesActive: 620,
        weatherTemperature: 18,
        weatherWindSpeed: 3.5,
        locationName: 'Central Park',
      }),
      LANGUAGES.english,
    );

    expect(sections.map(({ title }) => title)).toEqual([
      'Duration',
      'Distance',
      'Pace',
      'Elevation',
      'Speed',
      'Heart rate',
      'Technique',
      'Conditions',
      'Other',
    ]);
    expect(sections.find(({ title }) => title === 'Heart rate')?.metrics).toEqual([
      { label: 'Average', value: '140 bpm' },
      { label: 'Minimum', value: '90 bpm' },
      { label: 'Maximum', value: '175 bpm' },
    ]);
    expect(sections.find(({ title }) => title === 'Technique')?.metrics.map(({ label }) => label)).toEqual([
      'Steps',
      'Average cadence',
    ]);
    expect(sections.find(({ title }) => title === 'Conditions')?.metrics.map(({ label }) => label)).toEqual([
      'Temperature',
      'Wind',
      'Location',
    ]);
    expect(sections.find(({ title }) => title === 'Other')?.metrics).toEqual([
      { label: 'Active calories', value: '620 kcal' },
    ]);
  });

  it('omits optional sections when the activity has no corresponding data', () => {
    const sections = buildActivityStatisticSections(
      createActivity({ duration: 0, distance: 0, elevationGain: 0 }),
      LANGUAGES.russian,
    );

    expect(sections.map(({ title }) => title)).toEqual(['Длительность', 'Расстояние']);
  });

  it('shows speed and steps for a ride without adding running pace or cadence', () => {
    const sections = buildActivityStatisticSections(
      createActivity({ sport: 'bike', steps: 3_600, elevationGain: 0 }),
      LANGUAGES.english,
    );

    expect(sections.map(({ title }) => title)).toContain('Speed');
    expect(sections.map(({ title }) => title)).not.toContain('Pace');
    expect(sections.find(({ title }) => title === 'Technique')?.metrics.map(({ label }) => label)).toEqual(['Steps']);
  });

  it('omits metrics that the activity owner has restricted for other users', () => {
    const sections = buildActivityStatisticSections(
      createActivity({ averageHeartRate: 140, minHeartRate: 90, maxHeartRate: 175 }),
      LANGUAGES.english,
      { heartRate: false, elevation: false, pace: false },
    );

    expect(sections.map(({ title }) => title)).toEqual(['Duration', 'Distance']);
  });
});
