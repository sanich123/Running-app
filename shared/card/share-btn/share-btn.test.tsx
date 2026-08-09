import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { ROUTES } from '@const/enums';
import ShareBtn from './share-btn';
const mockPathname = `/${ROUTES.home}/${ROUTES.activity}`;
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));
describe('Activity card share btn', () => {
  it('should correctly renders', async () => {
    await render(<ShareBtn cardRef={{ current: null }} />);
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
  });

  it('captures and shares the activity card', async () => {
    const user = userEvent.setup();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
    (captureRef as jest.Mock).mockResolvedValue('snapshot.png');
    await render(<ShareBtn cardRef={{ current: {} as any }} />);
    await user.press(screen.getByTestId('iconShareBtn'));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalledWith('snapshot.png'));
  });
});
