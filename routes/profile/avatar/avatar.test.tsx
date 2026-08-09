import { screen } from '@testing-library/react-native';
import { savePhotoUrl, resetSettings } from '@R/slices/profile/profile';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfileAvatar from './avatar';

jest.mock('@S/custom-image/custom-image', () => ({
  CustomImage: ({ testID, source }: { testID?: string; source: { uri: string } }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{source.uri}</Text>;
  },
}));

describe('avatar', () => {
  beforeEach(() => mockStore.dispatch(resetSettings()));

  it('shows the default avatar when no profile photo exists', async () => {
    await renderWithProviders(<ProfileAvatar />);
    expect(screen.getByTestId('avatarEditableDefaultIcon')).toBeOnTheScreen();
  });

  it('shows the saved profile photo when one exists', async () => {
    mockStore.dispatch(savePhotoUrl('https://example.com/profile.jpg'));
    await renderWithProviders(<ProfileAvatar />);
    expect(screen.getByTestId('avatarEditableImage')).toHaveTextContent('https://example.com/profile.jpg');
    expect(screen.queryByTestId('avatarEditableDefaultIcon')).not.toBeOnTheScreen();
  });
});
