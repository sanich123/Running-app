import type { ProfilePrivacySettingKey } from '../const';

export interface ProfilePrivacySettingsProps {
  userId: string;
  profileSearchVisible: boolean;
  allowNewFollowers?: boolean;
  allowActivityInteractions: boolean;
  allowActivityReplayViewing?: boolean;
  allowActivityHeartRateViewing?: boolean;
  allowActivitySharing?: boolean;
  hideActivityStatistics: boolean;
  hideFollowingList: boolean;
  hideProfilePhotos: boolean;
}

export type ProfilePrivacyValues = Record<ProfilePrivacySettingKey, boolean>;
