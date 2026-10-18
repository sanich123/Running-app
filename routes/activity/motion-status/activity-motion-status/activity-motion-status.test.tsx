import { screen } from '@testing-library/react-native';
import { STATUSES } from '@const/enums';
import { setActivityStatus } from '@R/slices/location/location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMotionStatus from './activity-motion-status';

jest.mock('../active-motion-status/active-motion-status', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ language }: { language: string }) => <Text testID="active-motion-status">{language}</Text>,
  };
});

describe('ActivityMotionStatus', () => {
  beforeEach(() => mockStore.dispatch(resetMockLocation()));

  it('shows motion status only while activity tracking is active', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<ActivityMotionStatus />);

    expect(screen.getByTestId('active-motion-status')).toBeOnTheScreen();
  });
});
