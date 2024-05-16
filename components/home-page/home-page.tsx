import OptimizedList from '@C/flash-list/flash-list';
import FloatingBtn from '@C/floating-btn/floating-btn';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import {
  setIsManualAdding,
  resetFinishedActivity,
  resetManualData,
  resetActivityInfo,
  setIsEditingActivity,
} from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feed() {
  const { push } = useRouter();
  const dispatch = useAppDispatch();

  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  return (
    <>
      {Platform.OS === 'web' ? (
        <OptimizedList />
      ) : (
        <SafeAreaView edges={['left', 'right']} style={[{ flex: 1 }, { justifyContent: 'center' }]}>
          {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
          <OptimizedList />
          <FloatingBtn
            onPressFn={() => {
              dispatch(setIsManualAdding(true));
              dispatch(setIsEditingActivity(false));
              dispatch(resetFinishedActivity());
              dispatch(resetManualData());
              dispatch(resetActivityInfo());
              push('/(tabs)/home/manual-activity');
            }}
          />
        </SafeAreaView>
      )}
    </>
  );
}
