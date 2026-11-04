import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupPhoto from './group-photo';

describe('GroupPhoto', () => {
  it('shows a pending group photo to non-owners as a blurhash with a moderation button', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoPreviewUrl="https://cdn.example.test/private-preview.jpg"
        photoBlurhash="pending-blurhash"
        photoReviewStatus="processing"
        photoPending
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.queryByTestId('group-photo-image')).toBeNull();
    expect(screen.getByTestId('group-photo-placeholder')).toBeOnTheScreen();
    expect(screen.getByTestId('group-photo-placeholder-blurhash')).toHaveProp(
      'placeholder',
      'blurhash:/pending-blurhash',
    );
    expect(screen.getByTestId('group-photo-moderation-status')).toHaveProp('accessibilityRole', 'button');
  });

  it('shows the owner moderation preview with its blurhash and without a status overlay', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoPreviewUrl="https://cdn.example.test/private-preview.jpg"
        photoBlurhash="pending-blurhash"
        photoReviewStatus="queued"
        photoPending
        isOwner
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.getByTestId('group-photo-image')).toHaveProp('source', {
      uri: 'https://cdn.example.test/private-preview.jpg',
    });
    expect(screen.getByTestId('group-photo-image')).toHaveProp('placeholder', 'blurhash:/pending-blurhash');
    expect(screen.queryByTestId('group-photo-moderation-status')).toBeNull();
  });

  it('shows an approved photo fallback when the public URL is absent', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoPreviewUrl="https://cdn.example.test/published-photo.jpg"
        photoReviewStatus="approved"
        photoPending={false}
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.getByTestId('group-photo-image')).toHaveProp('source', {
      uri: 'https://cdn.example.test/published-photo.jpg',
    });
    expect(screen.queryByTestId('group-photo-moderation-status')).toBeNull();
  });

  it('recognizes a pending photo from its blurhash when moderation flags are absent', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoPreviewUrl="https://cdn.example.test/private-preview.jpg"
        photoBlurhash="pending-blurhash"
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.queryByTestId('group-photo-image')).toBeNull();
    expect(screen.getByTestId('group-photo-placeholder-blurhash')).toHaveProp(
      'placeholder',
      'blurhash:/pending-blurhash',
    );
    expect(screen.getByTestId('group-photo-moderation-status')).toHaveProp('accessibilityRole', 'button');
  });
});
