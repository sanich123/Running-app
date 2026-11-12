import type { ProfilePrivacySettingsProps } from './profile-privacy-settings/types';
import type { ProfileType } from '@S/card/types';

export function getProfilePrivacySettingsProps(userId: string, profile: ProfileType): ProfilePrivacySettingsProps {
  return {
    userId,
    profileSearchVisible: profile.profileSearchVisible !== false,
    allowNewFollowers: profile.allowNewFollowers !== false,
    allowActivityInteractions: profile.allowActivityInteractions !== false,
    allowActivityReplayViewing: profile.allowActivityReplayViewing !== false,
    allowActivityHeartRateViewing: profile.allowActivityHeartRateViewing !== false,
    allowActivityElevationViewing: profile.allowActivityElevationViewing !== false,
    allowActivityPaceViewing: profile.allowActivityPaceViewing !== false,
    allowActivitySharing: profile.allowActivitySharing !== false,
    hideActivityStatistics: profile.hideActivityStatistics === true,
    hideFollowingList: profile.hideFollowingList === true,
    hideProfilePhotos: profile.hideProfilePhotos === true,
  };
}
