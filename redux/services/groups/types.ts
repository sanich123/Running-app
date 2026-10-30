export type GroupSport = 'run' | 'walk' | 'hike' | 'bike';
export type GroupCategoryTag =
  | 'casual'
  | 'brand'
  | 'team'
  | 'corporate'
  | 'coach'
  | 'creator'
  | 'event'
  | 'local'
  | 'fundraiser'
  | 'advice'
  | 'social'
  | 'other';
export type GroupPrivacy = 'open' | 'closed';
export type GroupMemberStatus = 'active' | 'pending' | 'rejected';
export type GroupMemberRole = 'owner' | 'admin' | 'member';
export type GroupListScope = 'all' | 'mine';
export type GroupNotificationPreference = 'all' | 'announcements' | 'off';
export type GroupFeedPreference = 'all' | 'admins';

export interface GroupMembership {
  status: GroupMemberStatus;
  role: GroupMemberRole;
  notificationPreference: GroupNotificationPreference;
  feedPreference: GroupFeedPreference;
}

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  sports: GroupSport[];
  categoryTags: GroupCategoryTag[];
  photoUrl: string | null;
  privacy: GroupPrivacy;
  locationName: string | null;
  createdAt: string;
  createdByUserId: string;
  memberCount: number;
  currentMembership: GroupMembership | null;
  canManage: boolean;
  pendingRequestCount: number;
}

export interface GroupMember {
  userId: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt: string | null;
  profile: {
    name: string | null;
    surname: string | null;
    city: string | null;
    profilePhoto: string | null;
  } | null;
}

export interface GroupDetails extends GroupSummary {
  updatedAt: string;
}

export interface GroupsQuery {
  scope?: GroupListScope;
  search?: string;
  sport?: GroupSport;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  sports: GroupSport[];
  categoryTags?: GroupCategoryTag[];
  photoAssetId?: string;
  privacy: GroupPrivacy;
  locationName?: string;
}

export interface UpdateGroupMemberRequest {
  groupId: string;
  userId: string;
  status: 'active' | 'rejected' | 'removed';
}

export interface GroupMemberUpdateResult {
  userId: string;
  role: GroupMemberRole;
  status: GroupMemberStatus | 'removed';
  joinedAt?: string | null;
  profile?: GroupMember['profile'];
}

export interface GroupMonthlyStatisticsItem {
  userId: string;
  profile: GroupMember['profile'];
  totalDistance: number;
}

export interface GroupMonthlyStatistics {
  year: number;
  month: number;
  timeZone: string;
  items: GroupMonthlyStatisticsItem[];
}

export interface GroupMonthlyStatisticsQuery {
  groupId: string;
  year: number;
  month: number;
  timeZone: string;
}

export interface UpdateGroupPreferencesRequest {
  groupId: string;
  notificationPreference: GroupNotificationPreference;
  feedPreference: GroupFeedPreference;
}

export interface GroupPost {
  id: string;
  text: string;
  createdAt: string;
  author: { userId: string; name: string | null; profilePhoto: string | null } | null;
  photoUrl: string | null;
}

export interface CreateGroupPostRequest {
  groupId: string;
  text: string;
  photoAssetId?: string;
}

export interface GroupEvent {
  id: string;
  title: string;
  description: string | null;
  locationName: string | null;
  startsAt: string;
  createdAt: string;
}

export interface GroupEventsQuery {
  groupId: string;
  period: 'upcoming' | 'past';
}

export interface CreateGroupEventRequest {
  groupId: string;
  title: string;
  description?: string;
  locationName?: string;
  startsAt: string;
}
