import type { RefObject } from 'react';
import { act, screen, userEvent } from '@testing-library/react-native';
import { setSavingDisabled } from '@R/slices/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import SportsBtns from './sports-btns';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ sport: 'run' }),
  useRouter: () => ({ setParams: jest.fn() }),
}));

const mockPresent = jest.fn();
jest.mock('@S/choose-sport-modal/choose-sport-modal', () => {
  const { View } = jest.requireActual('react-native');
  return ({ chooseSportModalRef }: { chooseSportModalRef: RefObject<BottomSheetModal | null> }) => {
    Reflect.set(chooseSportModalRef, 'current', { present: mockPresent });
    return <View testID="manual-sport-modal" />;
  };
});

describe('sports btns', () => {
  it('opens the sport picker for a manual activity', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SportsBtns />);
    await user.press(screen.getByTestId('manual-activity-sport-picker'));
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it('uses the disabled appearance while saving', async () => {
    mockStore.dispatch(setSavingDisabled(true));
    await renderWithProviders(<SportsBtns />, { store: mockStore });

    expect(screen.getByTestId('manual-activity-sport-picker')).toHaveStyle({ opacity: 0.7 });
    await act(async () => {
      mockStore.dispatch(setSavingDisabled(false));
    });
  });

  it('uses the selected activity control style', async () => {
    await renderWithProviders(<SportsBtns />);

    expect(screen.getByTestId('manual-activity-sport-picker')).toHaveStyle({
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 56,
    });
  });
});
