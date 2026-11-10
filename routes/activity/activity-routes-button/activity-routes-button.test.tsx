import { screen, userEvent } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityRoutesButton from './activity-routes-button';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('activity routes button', () => {
  beforeEach(() => mockPush.mockReset());

  it('opens the route library', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ActivityRoutesButton />);

    const buttonStyle = StyleSheet.flatten(screen.getByTestId('activity-routes-button').props.style);
    expect(buttonStyle.width).toBe(Platform.OS === 'ios' ? 44 : 40);
    expect(buttonStyle.height).toBe(Platform.OS === 'ios' ? 44 : 40);

    await user.press(screen.getByTestId('activity-routes-button'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.routes}`);
  });
});
