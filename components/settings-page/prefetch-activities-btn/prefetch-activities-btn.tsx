import { View, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { SETTINGS } from '../const';
import { Text, Switch } from 'react-native-paper';
import { setisNeedToPrefetchActivities } from '@R/profile/profile';

export default function PrefetcActivitiesBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const dispatch = useAppDispatch();

  return (
    <View style={styles.togglers}>
      <Text variant="titleSmall">{`${isNeedToPrefetchActivities ? SETTINGS[language].switchOn : SETTINGS[language].switchOff} ${SETTINGS[language].prefetch}`}</Text>
      <Switch
        value={isNeedToPrefetchActivities}
        onValueChange={() => {
          dispatch(setisNeedToPrefetchActivities());
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  togglers: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
});
