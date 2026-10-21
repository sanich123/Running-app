import type { RefObject } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import IconChooseSport from './icon-choose-sport';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

const mockPresent = jest.fn();
jest.mock('@S/choose-sport-modal/choose-sport-modal', () => {
  const { View } = jest.requireActual('react-native');
  return ({ chooseSportModalRef }: { chooseSportModalRef: RefObject<BottomSheetModal | null> }) => {
    Reflect.set(chooseSportModalRef, 'current', { present: mockPresent });
    return <View testID="choose-sport-modal" />;
  };
});

describe('icon choose sport', () => {
  beforeEach(() => mockPresent.mockClear());

  it('opens the sport picker', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<IconChooseSport />);
    await user.press(screen.getByTestId('choose-activity-sport'));
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it('does not open the sport picker when it is disabled', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<IconChooseSport disabled />);
    await user.press(screen.getByTestId('choose-activity-sport'));
    expect(mockPresent).not.toHaveBeenCalled();
  });
});
