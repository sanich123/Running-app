import { screen } from '@testing-library/react-native';

import CommentsLength from './comments-length';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
jest.mock('expo-router', () => ({
  useRouter: () => {
    return {
      push: jest.fn(),
    };
  },
}));
describe('Comments length', () => {
  it('should correctly renders received comments length', async () => {
    renderWithProviders(<CommentsLength activityId="189d2c10-463c-42f5-9f09-5e9fa6aa2720" />, { store: mockStore });
    expect(await screen.findByText('8 comments')).toBeOnTheScreen();
  });
});
