import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from './const';
import MediaModerationPlaceholder from './media-moderation-placeholder';

describe('MediaModerationPlaceholder', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.russian)));

  it('explains that queued media is under review and may take several minutes', async () => {
    await renderWithProviders(<MediaModerationPlaceholder status="queued" />);
    expect(screen.getByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].queued)).toBeOnTheScreen();
    expect(screen.getByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].detail)).toBeOnTheScreen();
  });

  it('shows review-required status without detail text in compact mode', async () => {
    await renderWithProviders(<MediaModerationPlaceholder status="review_required" compact />);
    expect(screen.getByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].reviewRequired)).toBeOnTheScreen();
    expect(screen.queryByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].detail)).toBeNull();
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
