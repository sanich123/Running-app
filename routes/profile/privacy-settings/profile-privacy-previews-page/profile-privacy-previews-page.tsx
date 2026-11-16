import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import ActivityPrivacyPreview from '../profile-privacy-settings/activity-privacy-preview/activity-privacy-preview';
import ProfilePrivacyPreview from '../profile-privacy-settings/profile-privacy-preview/profile-privacy-preview';
import { getPrivacyValues } from '../profile-privacy-settings/utils';
import { getProfilePrivacySettingsProps } from '../utils';

export default function ProfilePrivacyPreviewsPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserProfileByUserIdQuery(userId ?? '', {
    skip: !userId,
  });
  const privacySettings = profile && userId ? getPrivacyValues(getProfilePrivacySettingsProps(userId, profile)) : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: colors.background,
          width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="profile-privacy-previews-loading" />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : privacySettings ? (
        <>
          <ProfilePrivacyPreview
            profileSearchVisible={privacySettings.profileSearchVisible}
            allowNewFollowers={privacySettings.allowNewFollowers}
            hideActivityStatistics={privacySettings.hideActivityStatistics}
            hideFollowingList={privacySettings.hideFollowingList}
            hideProfilePhotos={privacySettings.hideProfilePhotos}
            language={language}
          />
          <ActivityPrivacyPreview
            allowActivityInteractions={privacySettings.allowActivityInteractions}
            allowActivityReplayViewing={privacySettings.allowActivityReplayViewing}
            allowActivityHeartRateViewing={privacySettings.allowActivityHeartRateViewing}
            allowActivityElevationViewing={privacySettings.allowActivityElevationViewing}
            allowActivityPaceViewing={privacySettings.allowActivityPaceViewing}
            allowActivitySharing={privacySettings.allowActivitySharing}
            language={language}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 12,
    padding: 12,
  },
});
