import { SPORTS_BTNS_VALUES } from '@const/sports';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import type { ActivityToSend } from '@R/services/activity/types';

export const MOCK_UNSYNCED_ACTIVITY: ActivityToSend = {
  body: {
    description: 'Unsynced activity',
    distance: 1000,
    duration: 60000,
    emotion: EMOTIONS_BTNS_VALUES.normal,
    isPublic: true,
    kilometresSplit: [],
    locations: [],
    photoVideoUrls: [],
    speed: 10,
    sport: SPORTS_BTNS_VALUES.run,
    title: 'Unsynced activity',
  },
  id: 'someUserId',
};
