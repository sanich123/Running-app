import { SPORTS_BTNS_VALUES } from '@const/sports';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import type { PendingActivity } from '@R/slices/activity/types';

export const MOCK_UNSYNCED_ACTIVITY: PendingActivity = {
  routeJournalId: null,
  body: {
    description: 'Unsynced activity',
    distance: 1000,
    duration: 60000,
    emotion: EMOTIONS_BTNS_VALUES.normal,
    visibility: 'public',
    kilometresSplit: [],
    media: [],
    speed: 10,
    sport: SPORTS_BTNS_VALUES.run,
    title: 'Unsynced activity',
    timeZone: 'UTC',
  },
  id: 'someUserId',
};
