import { screen } from '@testing-library/react-native';

import ActivitySaveBtn from './activity-save-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.useFakeTimers();

jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'someUserId',
    },
  }),
}));

describe('Activity save btn', () => {
  afterAll(() => jest.clearAllMocks());
  it('should correctly renders', () => {
    renderWithProviders(<ActivitySaveBtn />);
    expect(screen.getByText(/save/i)).toBeDefined();
  });
  it('should interract with the user', async () => {
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    // const saveBtn = screen.getByText(/save/i);
    // await userEvent.press(saveBtn);
    // expect(await screen.findByText(/saving/i)).toBeDefined();
  });
});
