import { fireEvent, screen } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PrefetchActivitiesBtn from './prefetch-activities-btn';

describe('prefetch activities btn', () => {
  it('toggles activity preloading', async () => {
    const before = mockStore.getState().profile.isNeedToPrefetchActivities;
    await renderWithProviders(<PrefetchActivitiesBtn />);
    await fireEvent(screen.getByTestId('prefetch-activities-switch'), 'valueChange', !before);
    expect(mockStore.getState().profile.isNeedToPrefetchActivities).toBe(!before);
  });
});
