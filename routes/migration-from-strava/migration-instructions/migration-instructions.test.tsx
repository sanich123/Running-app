import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { STRAVA_EXPORT_URL, MIGRATION_STATES } from '../const';
import type * as MigrationInstructionsModule from './migration-instructions';

const mockOpenLink = jest.fn();

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');

  return {
    Link: ({ children, href, testID }: { children: ReactNode; href: string; testID?: string }) =>
      React.createElement(
        Pressable,
        { testID, accessibilityRole: 'link', onPress: () => mockOpenLink(href) },
        React.createElement(Text, null, children),
      ),
  };
});

const MigrationInstructions = require('./migration-instructions').default as typeof MigrationInstructionsModule.default;

describe('MigrationInstructions', () => {
  it('opens the official export guide when the user follows the instructions link', async () => {
    const user = userEvent.setup();

    await renderWithProviders(<MigrationInstructions copy={MIGRATION_STATES.english} />);
    await user.press(screen.getByTestId('migration-export-instructions'));

    expect(mockOpenLink).toHaveBeenCalledWith(STRAVA_EXPORT_URL);
  });
});
