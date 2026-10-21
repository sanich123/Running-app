import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, List, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { PROFILE_PRIVACY_SETTINGS } from '../const';
import ProfilePrivacySettings from '../profile-privacy-settings/profile-privacy-settings';

export default function ProfilePrivacySettingsPage() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserProfileByUserIdQuery(userId ?? '', {
    skip: !userId,
  });

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
        <ActivityIndicator size="large" testID="profile-privacy-settings-loading" />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : profile && userId ? (
        <>
          <ProfilePrivacySettings
            key={[
              profile.profileSearchVisible !== false,
              profile.allowNewFollowers !== false,
              profile.allowActivityInteractions !== false,
              profile.allowActivityReplayViewing !== false,
              profile.allowActivityHeartRateViewing !== false,
              profile.allowActivityElevationViewing !== false,
              profile.allowActivityPaceViewing !== false,
              profile.allowActivitySharing !== false,
              profile.hideActivityStatistics === true,
              profile.hideFollowingList === true,
              profile.hideProfilePhotos === true,
            ].join(':')}
            userId={userId}
            profileSearchVisible={profile.profileSearchVisible !== false}
            allowNewFollowers={profile.allowNewFollowers !== false}
            allowActivityInteractions={profile.allowActivityInteractions !== false}
            allowActivityReplayViewing={profile.allowActivityReplayViewing !== false}
            allowActivityHeartRateViewing={profile.allowActivityHeartRateViewing !== false}
            allowActivityElevationViewing={profile.allowActivityElevationViewing !== false}
            allowActivityPaceViewing={profile.allowActivityPaceViewing !== false}
            allowActivitySharing={profile.allowActivitySharing !== false}
            hideActivityStatistics={profile.hideActivityStatistics === true}
            hideFollowingList={profile.hideFollowingList === true}
            hideProfilePhotos={profile.hideProfilePhotos === true}
          />
          <List.Item
            testID="blocked-users-settings-link"
            title={PROFILE_PRIVACY_SETTINGS[language].manageBlockedUsers}
            description={PROFILE_PRIVACY_SETTINGS[language].manageBlockedUsersDescription}
            left={(props) => <List.Icon {...props} icon="account-cancel-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => push(`/${ROUTES.profile}/${ROUTES.profilePrivacySettings}/${ROUTES.blockedUsers}`)}
            style={[styles.blockedUsersLink, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
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
    padding: 12,
  },
  blockedUsersLink: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
});
