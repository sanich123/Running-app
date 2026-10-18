import { fireEvent, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import FeedbackBtn from './feedback-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('FeedbackBtn', () => {
  it('opens the feedback route when pressed', async () => {
    await renderWithProviders(<FeedbackBtn />);

    fireEvent.press(screen.getByTestId('feedback-btn'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.feedback}`);
  });
});
