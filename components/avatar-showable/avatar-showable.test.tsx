import { screen } from '@testing-library/react-native';

import AvatarShowable from './avatar-showable';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Avatar showable', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<AvatarShowable size={25} id="someUserId" />, { store: mockStore });
    // expect(screen.getByTestId('avatarShowableActivityIndicator')).toBeOnTheScreen();
    // expect(await screen.findByTestId('avatarShowableImage')).toBeOnTheScreen();
    // screen.debug();
  });
});
