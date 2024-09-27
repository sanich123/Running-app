import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { ForgroundLocationSwitcher } from '../types';

export default function ForegroundLocationSwitcher({
  foregroundPermissionStatus,
  requestForegroundPermission,
}: ForgroundLocationSwitcher) {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${language === LANGUAGES.russian ? 'Включить отслеживание местоположения' : 'Turn on access to foreground location service'}`}</Text>
      <Switch
        value={foregroundPermissionStatus.granted}
        onValueChange={async () => {
          try {
            await requestForegroundPermission();
          } catch (error) {
            showCrossPlatformToast(JSON.stringify(error));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
});
