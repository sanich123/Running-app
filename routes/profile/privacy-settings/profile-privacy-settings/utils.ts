import type { ProfilePrivacySettingsProps, ProfilePrivacyValues } from './types';

export function getPrivacyValues(props: ProfilePrivacySettingsProps): ProfilePrivacyValues {
  return {
    profileSearchVisible: props.profileSearchVisible,
    allowNewFollowers: props.allowNewFollowers !== false,
    allowActivityInteractions: props.allowActivityInteractions,
    allowActivityReplayViewing: props.allowActivityReplayViewing !== false,
    allowActivityHeartRateViewing: props.allowActivityHeartRateViewing !== false,
    allowActivityElevationViewing: props.allowActivityElevationViewing !== false,
    allowActivityPaceViewing: props.allowActivityPaceViewing !== false,
    allowActivitySharing: props.allowActivitySharing !== false,
    hideActivityStatistics: props.hideActivityStatistics,
    hideFollowingList: props.hideFollowingList,
    hideProfilePhotos: props.hideProfilePhotos,
  };
}
