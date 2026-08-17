import { SPORTS_BTNS_VALUES } from '@const/sports';

export const ADDITIONAL_INFO_INITIAL_STATE = {
  sport: SPORTS_BTNS_VALUES.run,
  photoVideoUrls: [] as { url: string; thumbnail: string }[],
};
