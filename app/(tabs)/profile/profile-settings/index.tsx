import { lazy, Suspense, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyAvatarIconEditable = lazy(() => import('@Routes/avatar/editable/editable'));
const LazyGenderBtns = lazy(() => import('@Routes/save-activity-page/gender-btns/gender-btns'));
const LazyInputBio = lazy(() => import('@Routes/save-activity-page/input-bio/input-bio'));
const LazyInputsNameSurname = lazy(() => import('@Routes/save-activity-page/inputs-name-surname/inputs-name-surname'));
const LazyInputsWeightCity = lazy(() => import('@Routes/save-activity-page/inputs-weight-city/inputs-weight-city'));

export default function ProfileSettings() {
  const { colors } = useTheme();
  const [isDisabled, setIsDisabled] = useState(false);
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
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
        <LazyAvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={isDisabled} />
        <LazyInputsNameSurname isDisabled={isDisabled} />
        <LazyInputsWeightCity isDisabled={isDisabled} />
        <LazyInputBio isDisabled={isDisabled} />
        <LazyGenderBtns isDisabled={isDisabled} />
      </Suspense>
    </ScrollView>
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
});
