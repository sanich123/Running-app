import { SPORTS_BTNS_VALUES } from '@const/sports';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';

export const ADDITIONAL_INFO_INITIAL_STATE = {
  title: '',
  description: '',
  sport: SPORTS_BTNS_VALUES.run,
  emotion: EMOTIONS_BTNS_VALUES.normal,
  isPublic: true,
  photoVideoUrls: [] as { url: string; thumbnail: string }[],
};
