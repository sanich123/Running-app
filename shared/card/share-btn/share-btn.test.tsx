import { screen, userEvent, waitFor } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { renderWithProviders } from '@T/utils/test-utils';
import { ActivityCardContext } from '../context';
import ShareBtn from './share-btn';
import type { ActivityCardData } from '../types';
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));

const activity: ActivityCardData = {
  date: '2026-08-09T10:00:00.000Z',
  sport: 'run',
  id: 'activity-id',
  userId: 'user-id',
  duration: 300000,
  distance: 5000,
  elevationGain: 0,
  profile: MOCK_PROFILE,
  commentsLength: 0,
};

function renderShareBtn() {
  return renderWithProviders(
    <ActivityCardContext.Provider value={{ activity, isFullView: false, isShowDescription: false }}>
      <ShareBtn />
    </ActivityCardContext.Provider>,
  );
}

describe('Activity card share btn', () => {
  it('should correctly renders', async () => {
    await renderShareBtn();
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
  });

  it('captures and shares the activity card', async () => {
    const user = userEvent.setup();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
    (captureRef as jest.Mock).mockResolvedValue('snapshot.png');
    await renderShareBtn();
    await user.press(screen.getByTestId('iconShareBtn'));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalledWith('snapshot.png'));
  });
});
