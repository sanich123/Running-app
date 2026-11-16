import type { LANGUAGES } from '@const/enums';

export interface ProfilePrivacyPreviewProps {
  profileSearchVisible: boolean;
  allowNewFollowers: boolean;
  hideActivityStatistics: boolean;
  hideFollowingList: boolean;
  hideProfilePhotos: boolean;
  hideHeading?: boolean;
  language: LANGUAGES;
}
