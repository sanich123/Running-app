import { screen, userEvent } from '@testing-library/react-native';

import ActivitySaveBtn from './activity-save-btn';
import { NavigationMock } from '../../tests/utils/mock-router';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'someUserId',
    },
  }),
}));

describe('Activity save btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivitySaveBtn />);
    expect(screen.getByText(/save/i)).toBeDefined();
  });
  it('should interract with the user', async () => {
    jest.useFakeTimers();
    renderWithProviders(<NavigationMock Controller={() => <ActivitySaveBtn />} />, { store: mockStore });
    const saveBtn = screen.getByText(/save/i);
    await userEvent.press(saveBtn);
    expect(await screen.findByText(/saving/i)).toBeDefined();
  });
});
