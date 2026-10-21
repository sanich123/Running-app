import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { DASHBOARD_LABELS } from '../const';
import { getDateKey } from '../utils';
import ActivityHeatmap from './activity-heatmap';

describe('ActivityHeatmap', () => {
  it('selects a visible activity day and opens its month', async () => {
    const date = new Date(2026, 9, 18);
    const onDayPress = jest.fn();
    const onOpenMonth = jest.fn();

    await renderWithProviders(
      <ActivityHeatmap
        heatmapColumns={[[{ date, intensity: 2, isOutsideYear: false }]]}
        monthSpans={[]}
        selectedDay={date}
        selectedDayGroups={[{ sport: 'run', distance: 0, duration: 0, steps: 0, caloriesActive: 0, activities: 1 }]}
        selectedDayIntensity={1}
        metric="activities"
        labels={DASHBOARD_LABELS[LANGUAGES.english]}
        language={LANGUAGES.english}
        onDayPress={onDayPress}
        onOpenMonth={onOpenMonth}
      />,
    );
    await fireEvent.press(screen.getByTestId(`dashboard-day-${getDateKey(date)}`));
    await fireEvent.press(screen.getByTestId('dashboard-open-month'));

    expect(onDayPress).toHaveBeenCalledWith(date);
    expect(onOpenMonth).toHaveBeenCalledTimes(1);
  });
});
