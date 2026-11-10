import type { GroupSummary } from '@R/services/groups/types';

export const GROUP_FIXTURE: GroupSummary = {
  id: 'group-1',
  name: 'Saturday runners',
  description: 'Morning runs together',
  sports: ['run'],
  categoryTags: ['team', 'local'],
  photoUrl: null,
  photoPreviewUrl: null,
  photoBlurhash: null,
  photoReviewStatus: null,
  photoPending: false,
  privacy: 'open',
  locationName: 'Moscow',
  createdAt: '2026-10-29T10:00:00.000Z',
  createdByUserId: 'owner-1',
  isOwner: false,
  memberCount: 3,
  currentMembership: null,
  canManage: false,
  pendingRequestCount: 0,
};
