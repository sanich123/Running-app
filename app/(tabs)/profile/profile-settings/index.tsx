import { Suspense, useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Platform, useWindowDimensions, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { HelperText, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import {
  LazyAvatarIconEditable,
  LazyGenderBtns,
  LazyInputBio,
  LazyInputsNameSurname,
  LazyInputsHeightAge,
  LazyInputsWeightCity,
} from '@Routes/app-routes/const';
import { HEIGHT_AGE } from '@Routes/profile/profile-settings/inputs-height-age/const';
import { getInitialProfileSettingsParams } from '@Routes/profile/profile-settings/profile-settings-params';
import ProfileUpdateBtn from '@Routes/profile/update-btn/profile-update-btn/profile-update-btn';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';
import type { ProfileSettingsSearchParams } from '@Routes/profile/profile-settings/profile-settings-params';

export default function ProfileSettings() {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { profileSettingsInitialized } = useLocalSearchParams() as Partial<ProfileSettingsSearchParams>;
  const { setParams } = useRouter();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isSuccess,
  } = useGetUserProfileByUserIdQuery(userId, {
    skip: !userId,
  });
  const [isDisabled, setIsDisabled] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!isSuccess || !profile || profileSettingsInitialized === 'true') {
      return;
    }

    setParams({
      profileSettingsInitialized: 'true',
      ...getInitialProfileSettingsParams(profile),
    });
  }, [isSuccess, profile, profileSettingsInitialized, setParams]);

  const isFormDisabled = isDisabled || isProfileLoading;

  return (
    <>
      <Stack.Screen options={{ headerRight: () => (userId ? <ProfileUpdateBtn /> : null) }} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: colors.background,
            width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
        ]}>
        <Suspense fallback={<FullPageActivityLoader />}>
          <LazyAvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={isFormDisabled} />
          <LazyInputsNameSurname isDisabled={isFormDisabled} />
          <LazyInputsWeightCity isDisabled={isFormDisabled} variant="city" />
          <LazyInputBio isDisabled={isFormDisabled} />
          <View style={styles.calorieInputsSection}>
            <HelperText type="info" style={styles.calorieInputsHint}>
              {HEIGHT_AGE[language].helper}
            </HelperText>
            <View style={styles.calorieMetricsRow}>
              <LazyInputsWeightCity isDisabled={isFormDisabled} variant="weight" compact />
              <LazyInputsHeightAge isDisabled={isFormDisabled} compact />
            </View>
            <LazyGenderBtns isDisabled={isFormDisabled} />
          </View>
        </Suspense>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  calorieInputsSection: {
    marginTop: 10,
    width: '100%',
    gap: 2,
  },
  calorieInputsHint: {
    alignSelf: 'flex-start',
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 0,
    paddingHorizontal: 12,
  },
  calorieMetricsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
});
