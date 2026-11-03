import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupPhoto from './group-photo';

describe('GroupPhoto', () => {
  it('hides an unpublished photo from other viewers and shows its blurhash and moderation status', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoUrl="https://cdn.example.test/quarantine-photo.jpg"
        photoBlurhash="pending-blurhash"
        photoReviewStatus="processing"
        photoPending
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.queryByTestId('group-photo-image')).toBeNull();
    expect(screen.getByTestId('group-photo-placeholder')).toBeOnTheScreen();
    expect(screen.getByTestId('group-photo-moderation-status')).toBeOnTheScreen();
  });

  it('shows the owner moderation preview without the viewer status overlay', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoPreviewUrl="https://cdn.example.test/private-preview.jpg"
        photoReviewStatus="queued"
        photoPending
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.getByTestId('group-photo-image')).toHaveProp('source', {
      uri: 'https://cdn.example.test/private-preview.jpg',
    });
    expect(screen.queryByTestId('group-photo-moderation-status')).toBeNull();
  });

  it('shows the public photo after moderation publishes it', async () => {
    await renderWithProviders(
      <GroupPhoto
        photoUrl="https://cdn.example.test/published-photo.jpg"
        photoReviewStatus="approved"
        style={{ height: 64, width: 64 }}
      />,
    );

    expect(screen.getByTestId('group-photo-image')).toHaveProp('source', {
      uri: 'https://cdn.example.test/published-photo.jpg',
    });
    expect(screen.queryByTestId('group-photo-moderation-status')).toBeNull();
  });
});
