import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { saveWholeProfile } from '@R/slices/profile/profile';
import { MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import MigrationBtn from './migration-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('migration btn', () => {
  it('opens the Strava migration page for an existing profile', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(saveWholeProfile(MOCK_SERVER_PROFILE));
    await renderWithProviders(<MigrationBtn />);
    await user.press(screen.getByTestId('migration-settings-row'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.migration}`);
  });
});
