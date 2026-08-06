import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import IconChooseSport from './icon-choose-sport';

const mockPresent = jest.fn();
jest.mock('../choose-sport-modal/choose-sport-modal', () => {
  const { View } = jest.requireActual('react-native');
  return ({ chooseSportModalRef }: any) => {
    chooseSportModalRef.current = { present: mockPresent };
    return <View testID="choose-sport-modal" />;
  };
});

describe('icon choose sport', () => {
  it('opens the sport picker', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<IconChooseSport />);
    await user.press(screen.getByTestId('choose-activity-sport'));
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
