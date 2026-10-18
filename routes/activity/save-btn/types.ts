import type { ActivityToSend } from '@R/services/activity/types';
export type ActivityDetails = Pick<
  ActivityToSend['body'],
  'title' | 'description' | 'sport' | 'emotion' | 'visibility' | 'hideMap' | 'media'
>;
