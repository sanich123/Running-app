import { Platform, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { LABELS, LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { getHeaderIconSource, HEADER_ICON_SIZE, IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';
import AddTrackMenu from './add-track-menu/add-track-menu';
import { MAPS_PAGE_COPY } from './const';
import { importTrackFile } from './import-track';
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
          ...(Platform.OS !== 'ios' && {
            headerRight: () => {
              if (isRoutesPage) {
                return (
                  <AddTrackMenu
                    accessibilityLabel={actionLabel}
                    fromWorkoutsLabel={copy.addTrackFromWorkouts}
                    uploadTrackLabel={copy.uploadTrack}
                    onAddFromWorkouts={() => router.push(`/${ROUTES.addTrack}` as never)}
                    onUploadTrack={() => void importTrackFile(copy)}
                  />
                );
              }
              return (
                <IconButton
                  accessibilityLabel={actionLabel}
                  icon={getHeaderIconSource('plus', 'plus')}
                  iconColor={colors.primary}
                  size={HEADER_ICON_SIZE}
                  onPress={() => router.push(`/${ROUTES.createOfflineMap}` as never)}
                  testID="maps-add-action"
                />
              );
            },
          }),
        }}>
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar placement="right">
            {isRoutesPage ? (
              <Stack.Toolbar.Menu icon="plus" accessibilityLabel={actionLabel} tintColor={IOS_HEADER_ICON_COLOR}>
                <Stack.Toolbar.MenuAction icon="figure.run" onPress={() => router.push(`/${ROUTES.addTrack}` as never)}>
                  {copy.addTrackFromWorkouts}
                </Stack.Toolbar.MenuAction>
                <Stack.Toolbar.MenuAction icon="square.and.arrow.down" onPress={() => void importTrackFile(copy)}>
                  {copy.uploadTrack}
                </Stack.Toolbar.MenuAction>
              </Stack.Toolbar.Menu>
            ) : (
              <Stack.Toolbar.Button
                icon="plus"
                accessibilityLabel={actionLabel}
                tintColor={IOS_HEADER_ICON_COLOR}
                onPress={() => router.push(`/${ROUTES.createOfflineMap}` as never)}
              />
            )}
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
      <View style={[styles.page, { backgroundColor: colors.background }]}>
        {isRoutesPage ? <SavedTracksTab copy={copy} /> : <OfflineMapsTab copy={copy} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
});
