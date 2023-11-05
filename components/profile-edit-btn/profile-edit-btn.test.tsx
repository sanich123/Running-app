import { screen } from '@testing-library/react-native';

import ProfileEditBtn from './profile-edit-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Profile edit btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText('Edit')).toBeOnTheScreen();
  });
});
