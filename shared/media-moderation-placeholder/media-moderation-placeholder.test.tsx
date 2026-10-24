import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from './const';
import MediaModerationPlaceholder from './media-moderation-placeholder';

describe('MediaModerationPlaceholder', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.russian)));

  it('shows only the review status for queued media', async () => {
    await renderWithProviders(<MediaModerationPlaceholder status="queued" />);
    expect(screen.getByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].queued)).toBeOnTheScreen();
    expect(screen.queryByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].detail)).toBeNull();
  });

  it('shows review-required status without detail text in compact mode', async () => {
    await renderWithProviders(<MediaModerationPlaceholder status="review_required" compact />);
    expect(screen.getByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].reviewRequired)).toBeOnTheScreen();
    expect(screen.queryByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].detail)).toBeNull();
  });

  it('renders a compact moderation overlay over a blurred quarantine preview', async () => {
    const copy = MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian];

    await renderWithProviders(
      <MediaModerationPlaceholder status="processing" blurhash="LKO2?U%2Tw=w]~RBVZRi};RPxuwH" compact overlay />,
    );

    expect(screen.getByTestId('media-moderation-placeholder')).toBeOnTheScreen();
    expect(screen.getByText(copy.processing)).toBeOnTheScreen();
    expect(screen.queryByText(copy.detail)).toBeNull();
  });

  it.each([
    ['processing', 'processing', 'detail'],
    ['approved', 'approved', 'detail'],
    ['rejected', 'rejected', 'retry'],
    ['failed', 'failed', 'retry'],
  ] as const)(
    'renders the %s upload state and its next-step message in English',
    async (status, titleKey, detailKey) => {
      mockStore.dispatch(changeLanguage(LANGUAGES.english));
      const copy = MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.english];

      await renderWithProviders(<MediaModerationPlaceholder status={status} />);

      expect(screen.getByText(copy[titleKey])).toBeOnTheScreen();
      expect(screen.getByText(copy[detailKey])).toBeOnTheScreen();
    },
  );
});
