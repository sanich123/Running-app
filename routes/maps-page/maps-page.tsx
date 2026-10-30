import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { LABELS, LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAPS_PAGE_COPY } from './const';
import OfflineMapsTab from './offline-maps-tab/offline-maps-tab';
import SavedTracksTab from './saved-tracks-tab/saved-tracks-tab';

export default function MapsPage({ mode = 'maps' }: { mode?: 'maps' | 'routes' }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = MAPS_PAGE_COPY[language === LANGUAGES.english ? LANGUAGES.english : LANGUAGES.russian];
  const isRoutesPage = mode === 'routes';
  const actionLabel = isRoutesPage ? copy.addTrack : copy.createOfflineMap;

  return (
    <>
      <Stack.Screen
        options={{
          title: isRoutesPage ? LABELS[language].routes : LABELS[language].maps,
          headerRight: () => (
            <IconButton
              accessibilityLabel={actionLabel}
              icon="plus"
              onPress={() => router.push(`/${isRoutesPage ? ROUTES.addTrack : ROUTES.createOfflineMap}` as never)}
              testID={isRoutesPage ? 'routes-add-action' : 'maps-add-action'}
            />
          ),
        }}
      />
      <View style={[styles.page, { backgroundColor: colors.background }]}>
        {isRoutesPage ? <SavedTracksTab copy={copy} /> : <OfflineMapsTab copy={copy} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({ page: { flex: 1 } });
