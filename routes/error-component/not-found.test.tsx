import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import NotFoundScreen from '../../app/+not-found';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => {
    const { Pressable: MockPressable, Text: MockText } = jest.requireActual('react-native');
    return (
      <MockPressable testID="not-found-link" onPress={() => mockNavigate(href)}>
        <MockText>{children}</MockText>
      </MockPressable>
    );
  },
  Stack: { Screen: () => null },
}));

describe('NotFoundScreen', () => {
  it('opens sign in from the not found screen', async () => {
    const user = userEvent.setup();
    mockNavigate.mockClear();
    await renderWithProviders(<NotFoundScreen />);
    expect(screen.getByText('This screen does not exist.')).toBeOnTheScreen();
    await user.press(screen.getByTestId('not-found-link'));
    expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });
});
