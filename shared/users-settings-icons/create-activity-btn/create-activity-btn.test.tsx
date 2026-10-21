import { fireEvent, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import CreateActivityBtn from './create-activity-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('CreateActivityBtn', () => {
  it('opens a new manual activity form', async () => {
    await renderWithProviders(<CreateActivityBtn />);

    fireEvent.press(screen.getByTestId('createActivityIcon'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: `/${ROUTES.manualActivity}`,
        params: expect.objectContaining({ mode: 'manual' }),
      }),
    );
  });
});
